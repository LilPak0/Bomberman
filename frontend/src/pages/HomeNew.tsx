import React, { useEffect, useRef, useCallback } from 'react';
import { useGameState } from '../hook/useGameState';
import { GameBoard } from '../components/GameBoard';

function HomeNew() {
    const { gameState, movePlayer, triggerUpdate } = useGameState();
    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastMoveTime = useRef<{ [playerId: string]: number }>({});
    const keysPressed = useRef<Set<string>>(new Set());
    const MOVE_DELAY = 150;

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

    // Timer effect
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Movement update loop
    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = Date.now();
            const pressedKeys = Array.from(keysPressed.current);
            
            // Check each player's keys and move them if enough time has passed
            gameState.allPlayers.forEach(player => {
                // Only process input for alive players
                if (!player.isAlive) return;

                const lastMove = lastMoveTime.current[player.id] || 0;
                
                // Only move if enough time has passed since last move
                if (currentTime - lastMove >= MOVE_DELAY) {
                    // Check if any of this player's keys are pressed
                    const playerKeys = Object.values(player.keys);
                    const pressedPlayerKey = pressedKeys.find(key => playerKeys.includes(key));
                    
                    if (pressedPlayerKey) {
                        // Move the player
                        const moved = movePlayer(player.id, pressedPlayerKey);
                        if (moved) {
                            lastMoveTime.current[player.id] = currentTime;
                        }
                    }
                }
            });
        }, 50); // Check more frequently than move delay for smoother input

        return () => clearInterval(interval);
    }, [gameState.allPlayers, movePlayer]);

    // Update component when bombs explode (every 100ms for smooth updates)
    useEffect(() => {
        const interval = setInterval(() => {
            triggerUpdate();
        }, 100);

        return () => clearInterval(interval);
    }, [triggerUpdate]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-amber-950">
            <div className='flex justify-around w-full max-w-4xl mb-8 p-4 bg-gray-200 rounded-lg'>
                {gameState.allPlayers.map(player => (
                    <div key={player.id} className="text-center">
                        <div className={`text-2xl font-bold ${player.isAlive ? 'text-green-600' : 'text-red-600'}`}>
                            {player.id}: {player.isAlive ? '❤️' : '💀'} {player.lives}
                        </div>
                        <div className="text-xs">
                            {player.isAlive ? 'Alive' : 'Dead'}
                        </div>
                    </div>
                ))}
                <div className="text-2xl font-bold">
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                </div>
            </div>
            
            <GameBoard 
                players={gameState.players}
                bombs={gameState.bombs}
                fires={gameState.fires}
                walls={gameState.walls}
                destructibleBoxes={gameState.destructibleBoxes}
                boardSize={gameState.boardSize}
            />
        </div>
    );
}

export default HomeNew;
