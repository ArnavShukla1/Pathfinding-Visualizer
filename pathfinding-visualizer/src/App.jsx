import React, { useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 40;

const AStarPathfinder = () => {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => ({
        isStart: false,
        isEnd: false,
        isWall: false,
        isPath: false,
      }))
    )
  );
  const [currentTool, setCurrentTool] = useState('start');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const handleCellClick = (row, col) => {
    const newGrid = grid.map(r => [...r]);
    const cell = newGrid[row][col];

    if (currentTool === 'start') {
      if (start) newGrid[start.row][start.col].isStart = false;
      cell.isStart = true;
      setStart({ row, col });
    } else if (currentTool === 'end') {
      if (end) newGrid[end.row][end.col].isEnd = false;
      cell.isEnd = true;
      setEnd({ row, col });
    } else if (currentTool === 'wall') {
      cell.isWall = !cell.isWall;
    }

    setGrid(newGrid);
  };

  const resetGrid = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => ({
        isStart: false,
        isEnd: false,
        isWall: false,
        isPath: false,
      }))
    ));
    setStart(null);
    setEnd(null);
  };

  const manhattanDistance = (a, b) => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  const getNeighbors = (node) => {
    const { row, col } = node;
    const neighbors = [];
    if (row > 0) neighbors.push({ row: row - 1, col });
    if (row < GRID_SIZE - 1) neighbors.push({ row: row + 1, col });
    if (col > 0) neighbors.push({ row, col: col - 1 });
    if (col < GRID_SIZE - 1) neighbors.push({ row, col: col + 1 });
    return neighbors.filter(n => !grid[n.row][n.col].isWall);
  };

  const findPath = useCallback(() => {
    if (!start || !end) {
      alert('Please set both start and end points');
      return;
    }

    const newGrid = grid.map(row => row.map(cell => ({ ...cell, isPath: false })));
    const openSet = [start];
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    gScore[`${start.row},${start.col}`] = 0;
    fScore[`${start.row},${start.col}`] = manhattanDistance(start, end);

    while (openSet.length > 0) {
      let current = openSet.reduce((a, b) => 
        fScore[`${a.row},${a.col}`] < fScore[`${b.row},${b.col}`] ? a : b
      );

      if (current.row === end.row && current.col === end.col) {
        // Reconstruct path
        while (current) {
          newGrid[current.row][current.col].isPath = true;
          current = cameFrom[`${current.row},${current.col}`];
        }
        setGrid(newGrid);
        return;
      }

      openSet.splice(openSet.indexOf(current), 1);
      closedSet.add(`${current.row},${current.col}`);

      for (let neighbor of getNeighbors(current)) {
        if (closedSet.has(`${neighbor.row},${neighbor.col}`)) continue;

        const tentativeGScore = gScore[`${current.row},${current.col}`] + 1;

        if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= gScore[`${neighbor.row},${neighbor.col}`]) {
          continue;
        }

        cameFrom[`${neighbor.row},${neighbor.col}`] = current;
        gScore[`${neighbor.row},${neighbor.col}`] = tentativeGScore;
        fScore[`${neighbor.row},${neighbor.col}`] = gScore[`${neighbor.row},${neighbor.col}`] + manhattanDistance(neighbor, end);
      }
    }

    alert('No path found!');
  }, [grid, start, end]);

  const buttonStyle = (isActive) => ({
    padding: '10px 15px',
    margin: '0 5px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#4CAF50' : '#e7e7e7',
    color: isActive ? 'white' : 'black',
  });

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>A* Pathfinding Visualizer</h1>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button onClick={() => setCurrentTool('start')} style={buttonStyle(currentTool === 'start')}>Set Start</button>
        <button onClick={() => setCurrentTool('end')} style={buttonStyle(currentTool === 'end')}>Set End</button>
        <button onClick={() => setCurrentTool('wall')} style={buttonStyle(currentTool === 'wall')}>Draw Wall</button>
        <button onClick={findPath} style={buttonStyle(false)}>Find Path</button>
        <button onClick={resetGrid} style={buttonStyle(false)}>Reset Grid</button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gap: '1px',
        backgroundColor: '#ccc',
        border: '1px solid #ccc',
        margin: '0 auto',
      }}>
        {grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell.isStart ? 'green' : cell.isEnd ? 'red' : cell.isWall ? 'black' : cell.isPath ? 'yellow' : 'white',
                cursor: 'pointer',
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AStarPathfinder;