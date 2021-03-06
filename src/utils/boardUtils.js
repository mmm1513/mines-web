import seedrandom from 'seedrandom';

import { getInitializedCell, getCellType, Empty } from '../features/board/boardSlice';

const randomBomb = ({bombAmount, cellsAmount, randomeSeed}) => {
  return (randomeSeed() < (bombAmount / cellsAmount));
};

const excecuteActionOnNearCells = (x, y, height, width, board, action) => {
  for( let i = Math.max(0, x-1); i <= Math.min(height-1, x+1); i++) {
    for( let j = Math.max(0, y-1); j <= Math.min(width-1, y+1); j++) {
      action(i, j, board);
    }
  }
};

export const generateBoard = ({ height, width, bombAmount, randomSeedKey }) => {
  /** Generate a board with only bombs **/
  const randomeSeed = new seedrandom(randomSeedKey);
  let bombsPlaced = 0;
  let passedCells = 0;
  const bombsLocations = [];
  const newBoard = new Array(height);
  for( let i = 0; i < height; i++) {
    newBoard[i] = new Array(width);
    for( let j = 0; j < width; j++) {
      newBoard[i][j] = getInitializedCell();
      const isBomb = randomBomb({
        bombAmount: bombAmount - bombsPlaced,
        cellsAmount: height * width - passedCells,
        randomeSeed
      });
      if (isBomb) {
        bombsLocations.push([i, j])
        bombsPlaced += 1;
      }
      newBoard[i][j].isBomb = isBomb;
      passedCells += 1;
    }
  }

  /** Add closeBombs number **/
  const addBombsToNearCellsCounter = (i, j, board) => board[i][j].closeBombs += 1;
  bombsLocations.map(([x, y]) => excecuteActionOnNearCells( x, y, height, width, newBoard, addBombsToNearCellsCounter))

  return newBoard;
};

export const exposeNearCells = ({ x, y, height, width, board }) => {
  const exposeStack = [[x, y]];

  const exposeCell = (i, j, board) => {
    const cellData = board[i][j];
    const currentCellType = getCellType(cellData, true);
    if (!cellData.isSelected && (currentCellType === Empty)) {
        exposeStack.push([i, j]);
      }
      cellData.isSelected = !cellData.hasFlag;
  }
  
  while (exposeStack.length > 0) {
    const [x, y] = exposeStack[0];
    const currCellData = board[x][y];
    currCellData.isSelected = !currCellData.hasFlag;
    const cellType = getCellType(currCellData, true);
    if (cellType === Empty) {
      excecuteActionOnNearCells(x, y, height, width, board, exposeCell);
      }
    exposeStack.shift();
  }
};