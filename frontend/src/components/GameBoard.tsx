import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface PlayerEntity {
  id: string;
  position: Position;
  avatar: string;
  type: 'player';
  isAlive: boolean;
  lives: number;
  keys: {up: string, down: string, left: string, right: string, bomb: string};
}

interface BombEntity {
  id: string;
  position: Position;
  type: 'bomb';
}

interface GameBoardProps {
  players: PlayerEntity[];
  bombs: BombEntity[];
  fires: Position[];
  walls: Position[];
  destructibleBoxes: Position[]; // NEW!
  boardSize: { width: number; height: number };
}

export function GameBoard({ players, bombs, fires, walls, destructibleBoxes, boardSize }: GameBoardProps) {
  // Create a grid to track what's at each position
  const grid = Array(boardSize.height).fill(null).map(() => 
    Array(boardSize.width).fill(null).map(() => ({
      wall: false,
      fire: false,
      destructibleBox: false, // NEW!
      bomb: null as BombEntity | null,
      player: null as PlayerEntity | null
    }))
  );

  // Populate grid
  walls.forEach(wall => {
    grid[wall.y][wall.x].wall = true;
  });

  fires.forEach(fire => {
    grid[fire.y][fire.x].fire = true;
  });

  destructibleBoxes.forEach(box => {
    grid[box.y][box.x].destructibleBox = true;
  });

  bombs.forEach(bomb => {
    grid[bomb.position.y][bomb.position.x].bomb = bomb;
  });

  players.forEach(player => {
    grid[player.position.y][player.position.x].player = player;
  });

  return (
    <div className="w-full max-w-2xl">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full box-border">
          {row.map((cell, colIndex) => {
            let cellClass = "flex-1 aspect-square border flex items-center justify-center relative ";
            let cellContent = [];

            // Background based on cell type
            if (cell.wall) {
              cellClass += 'bg-gray-800 border border-gray-700';
            } else if (cell.destructibleBox) {
              cellClass += 'bg-amber-800 border border-amber-900'; // Darker brown with darker border
            } else if (cell.fire) {
              cellClass += 'bg-red-500 border-red-700'; // Bright red fire
            } else {
              cellClass += 'bg-white';
            }

            // Add bomb (background layer)
            if (cell.bomb) {
              cellContent.push(
                <img 
                  key="bomb" 
                  src="/icons/Bomb.gif" 
                  alt="Bomb" 
                  className="w-8 h-8 absolute"
                />
              );
            }

            // Add stone brick pattern for walls
            if (cell.wall) {
              cellContent.push(
                <div key="wall" className="w-full h-full relative">
                  {/* Main stone base with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"></div>
                  
                  {/* Brick lines */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900 opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 opacity-80"></div>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-900 opacity-60 transform -translate-y-0.5"></div>
                  
                  {/* Vertical mortar lines */}
                  <div className="absolute top-0 left-1/3 w-0.5 h-1/2 bg-gray-900 opacity-60"></div>
                  <div className="absolute bottom-0 left-2/3 w-0.5 h-1/2 bg-gray-900 opacity-60"></div>
                  
                  {/* Corner shadows for depth */}
                  <div className="absolute top-0 left-0 w-1 h-1 bg-gray-900 opacity-40"></div>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-gray-500 opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-1 h-1 bg-gray-900 opacity-40"></div>
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-gray-500 opacity-30"></div>
                  
                  {/* Stone texture dots */}
                  <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-gray-500 opacity-50 rounded-full"></div>
                  <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-gray-600 opacity-50 rounded-full"></div>
                  <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-gray-500 opacity-50 rounded-full"></div>
                  <div className="absolute bottom-2 right-1 w-0.5 h-0.5 bg-gray-600 opacity-50 rounded-full"></div>
                  
                  {/* Highlight for 3D effect */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gray-400 opacity-50"></div>
                  <div className="absolute top-0 left-0 w-px h-full bg-gray-400 opacity-50"></div>
                </div>
              );
            }

            // Add wooden crate pattern for destructible boxes
            if (cell.destructibleBox) {
              cellContent.push(
                <div key="crate" className="w-full h-full relative">
                  {/* Vertical lines */}
                  <div className="absolute left-1/4 top-0 w-0.5 h-full bg-amber-900 opacity-60"></div>
                  <div className="absolute right-1/4 top-0 w-0.5 h-full bg-amber-900 opacity-60"></div>
                  {/* Horizontal lines */}
                  <div className="absolute top-1/4 left-0 h-0.5 w-full bg-amber-900 opacity-60"></div>
                  <div className="absolute bottom-1/4 left-0 h-0.5 w-full bg-amber-900 opacity-60"></div>
                  {/* Corner reinforcements */}
                  <div className="absolute top-1 left-1 w-1 h-1 bg-amber-900 opacity-80"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-amber-900 opacity-80"></div>
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-amber-900 opacity-80"></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-amber-900 opacity-80"></div>
                </div>
              );
            }

            // Add player (top layer)
            if (cell.player) {
              cellContent.push(
                <div key="player" className="w-10 bg-white relative z-10">
                  <img src={cell.player.avatar} alt={cell.player.id} />
                </div>
              );
            }

            return (
              <div key={colIndex} className={cellClass}>
                {cellContent}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
