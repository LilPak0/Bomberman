import { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../hook/useGame';

function Home() {
    const game = useGame();
    const lastMoveTime = useRef<{ [playerId: string]: number }>({});
    const keysPressed = useRef<Set<string>>(new Set());
    const gameLoopRef = useRef<number | undefined>(undefined);
    const MOVE_DELAY = 150; // 100ms delay between moves (adjust for speed)

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        keysPressed.current.add(event.key);
    }, []);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        keysPressed.current.delete(event.key);
    }, []);


    // Set up and clean up event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);


    // Movement update loop
  useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        const pressedKeys = Array.from(keysPressed.current);
        
        // Check each player's keys and move them if enough time has passed
        Object.values(game.players).forEach(player => {
            const lastMove = lastMoveTime.current[player.id] || 0;
            
            // Only move if enough time has passed since last move
            if (currentTime - lastMove >= MOVE_DELAY) {
                // Check if any of this player's keys are pressed
                const playerKeys = Object.values(player.keys);
                const pressedPlayerKey = pressedKeys.find(key => playerKeys.includes(key));
                
                if (pressedPlayerKey) {
                    // Move the player
                    player.move(game.board, pressedPlayerKey, game.setBoard);
                    lastMoveTime.current[player.id] = currentTime;
                }
            }
        });
    }, 50); // Check more frequently than move delay for smoother input

    return () => clearInterval(interval);
  }, [game.board, game.players, game.setBoard]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-amber-950">
            <div className='flex justify-around w-full max-w-4xl mb-8 p-4 bg-gray-200 rounded-lg'>
                <div className="text-2xl font-bold">Player1: 0</div>
                <div className="text-2xl font-bold">Player2: 0</div>
                <div className="text-2xl font-bold">00:00</div>
                <div className="text-2xl font-bold">Player3: 0</div>
                <div className="text-2xl font-bold">Player4: 0</div>
            </div>
            <div className="w-full max-w-2xl">
                {game.board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex w-full box-border">
                        {row.map((cell, colIndex) => {
                            // Determine cell type for background and content
                            let cellClass = "flex-1 aspect-square border flex items-center justify-center ";
                            let cellContent = null;
                            
                            if (cell === 'wall') {
                                cellClass += 'bg-gray-800';
                            } else if (typeof cell === 'object' && cell !== null && cell.type === 'fire') {
                                cellClass += 'bg-orange-400 border-red-600';
                            } else {
                                cellClass += 'bg-white';
                            }

                            if (typeof cell === 'object' && cell !== null && cell.type === 'bomb') {
                                cellContent = <img src="/icons/Bomb.gif" alt="Bomb" className="w-8 h-8" />;
                            } else if (cell !== null && typeof cell === 'string' && cell.startsWith('player')) {
                                cellContent = (
                                    <div className={`w-10 bg-white`}>
                                        <img src={game.players[cell as keyof typeof game.players].avatar} alt="" />
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
            <div className="mt-4 text-sm text-gray-600">
                <div>Player 1 (Samurai): Arrow keys (↑↓←→) + Enter (bomb)</div>
                <div>Player 2 (Knight): WASD keys (W/S/A/D) + Space (bomb)</div>
                <div>Player 3 (Bomb2): IJKL keys (I/K/J/L) + M (bomb)</div>
                <div>Player 4 (Ninja): TFGH keys (T/G/F/H) + V (bomb)</div>
                <div className="mt-2 text-xs text-gray-500">
                    Movement speed: {MOVE_DELAY}ms delay between moves
                </div>
            </div>
        </div>
    );
}
export default Home;