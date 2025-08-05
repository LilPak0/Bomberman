import { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../hook/useGame';
import Player from '../classes/Player';

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

    const gameLoop = useCallback(() => {
        const currentTime = Date.now();
        
        // For each player on the board, check if their movement key is pressed
        type PlayerId = keyof typeof game.players;
        game.board.forEach((row) => {
            row.forEach((cell) => {
                if (typeof cell === 'string' && cell.startsWith('player')) {
                    const player = game.players[cell as PlayerId];
                    if (!player) return;
                    // Check if any of this player's movement keys are pressed
                    (Object.values(player.keys) as string[]).forEach((moveKey) => {
                        if (typeof moveKey === 'string' && keysPressed.current.has(moveKey)) {
                            const playerLastMove = lastMoveTime.current[player.id] || 0;
                            if (currentTime - playerLastMove >= MOVE_DELAY) {
                                player.move(game.board, moveKey, game.setBoard);
                                lastMoveTime.current[player.id] = currentTime;
                            }
                        }
                    });
                }
            });
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [game.board, game.setBoard, MOVE_DELAY]);

    useEffect(() => {
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Start game loop
        gameLoopRef.current = requestAnimationFrame(gameLoop);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [handleKeyDown, handleKeyUp, gameLoop]); 

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <div className='flex justify-around w-full max-w-4xl mb-8 p-4 bg-gray-200 rounded-lg'>
                <div className="text-2xl font-bold">Player1: 0</div>
                <div className="text-2xl font-bold">Player2: 0</div>
                <div className="text-2xl font-bold">00:00</div>
                <div className="text-2xl font-bold">Player3: 0</div>
                <div className="text-2xl font-bold">Player4: 0</div>
            </div>
            <div className="w-full max-w-2xl">
                {game.board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex w-full">
                        {row.map((cell, colIndex) => {
                            // Determine cell type for background and content
                            let cellClass = "flex-1 aspect-square border flex items-center justify-center ";
                            let cellContent = null;
                            if (cell === 'wall') {
                                cellClass += 'bg-gray-800';
                            } else if (typeof cell === 'object' && cell !== null && cell.type === 'fire') {
                                cellClass += 'bg-orange-400 border-2 border-red-600';
                            } else if (cell === null || (typeof cell === 'string' && !cell.startsWith('player'))) {
                                cellClass += 'bg-white';
                            }

                            if (typeof cell === 'object' && cell !== null && cell.type === 'bomb') {
                                cellContent = <img src="/icons/Bomb.gif" alt="Bomb" className="w-8 h-8" />;
                            } else if (cell !== null && typeof cell === 'string' && cell.startsWith('player')) {
                                cellContent = (
                                    <div className={`w-10`}>
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
                <div>Player 1 (Blue): Arrow keys (↑↓←→)</div>
                <div>Player 2 (Red): WASD keys (W/S/A/D)</div>
                <div>Player 3 (Green): IJKL keys (I/K/J/L)</div>
                <div>Player 4 (Yellow): TFGH keys (T/G/F/H)</div>
                <div className="mt-2 text-xs text-gray-500">
                    Movement speed: {MOVE_DELAY}ms delay between moves
                </div>
            </div>
        </div>
    );
}
export default Home;