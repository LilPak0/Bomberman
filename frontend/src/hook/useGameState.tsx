import { useState, useCallback, useRef } from 'react';
import { GameStateManager } from '../managers/GameStateManager';

export function useGameState() {
  const gameManager = useRef(new GameStateManager());
  const [, forceUpdate] = useState({});

  // Force React to re-render when game state changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  const movePlayer = useCallback((playerId: string, direction: string) => {
    const moved = gameManager.current.movePlayer(playerId, direction);
    if (moved) {
      triggerUpdate();
    }
    return moved;
  }, [triggerUpdate]);

  const getGameState = useCallback(() => {
    return {
      players: gameManager.current.getAlivePlayers(), // Only alive players for rendering
      allPlayers: gameManager.current.getAllPlayers(), // All players for UI (lives, etc.)
      bombs: gameManager.current.getBombs(),
      fires: gameManager.current.getFires(),
      walls: gameManager.current.getWalls(),
      destructibleBoxes: gameManager.current.getDestructibleBoxes(), // NEW!
      boardSize: gameManager.current.getBoardSize()
    };
  }, []);

  return {
    gameState: getGameState(),
    movePlayer,
    triggerUpdate
  };
}
