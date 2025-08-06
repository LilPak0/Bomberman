import Bomb from "../classes/Bomb";

interface Position {
  x: number;
  y: number;
}

interface GameEntity {
  id: string;
  position: Position;
  type: 'player' | 'bomb' | 'fire' | 'wall';
}

interface PlayerEntity extends GameEntity {
  type: 'player';
  avatar: string;
  keys: {up: string, down: string, left: string, right: string, bomb: string};
  isAlive: boolean;
  lives: number;
  maxBombs: number; // NEW!
  activeBombs: number; // NEW!
}

interface BombEntity extends GameEntity {
  type: 'bomb';
  owner: string;
  timer: number;
}

export class GameStateManager {
  private players: Map<string, PlayerEntity> = new Map();
  private bombs: Map<string, BombEntity> = new Map();
  private fires: Set<string> = new Set(); // "x,y" format
  private walls: Set<string> = new Set(); // "x,y" format
  private destructibleBoxes: Set<string> = new Set(); // "x,y" format - NEW!
  private boardSize = { width: 15, height: 15 };

  constructor() {
    this.initializeWalls();
    this.initializePlayers();
    this.generateDestructibleBoxes(); // NEW!
  }

  private initializeWalls() {
    // Add border walls and internal walls
    for (let y = 0; y < this.boardSize.height; y++) {
      for (let x = 0; x < this.boardSize.width; x++) {
        if (
          x === 0 || x === this.boardSize.width - 1 ||
          y === 0 || y === this.boardSize.height - 1 ||
          (x % 2 === 0 && y % 2 === 0)
        ) {
          this.walls.add(`${x},${y}`);
        }
      }
    }
  }

  private initializePlayers() {
    this.players.set('player1', {
      id: 'player1',
      type: 'player',
      position: { x: 1, y: 1 },
      avatar: '/icons/BombSamurai.png',
      keys: {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', bomb: 'Enter'},
      isAlive: true,
      lives: 3,
      maxBombs: 1,
      activeBombs: 0
    });

    this.players.set('player2', {
      id: 'player2',
      type: 'player',
      position: { x: 13, y: 1 },
      avatar: '/icons/BombKnight.png',
      keys: {up: 'w', down: 's', left: 'a', right: 'd', bomb: ' '},
      isAlive: true,
      lives: 3,
      maxBombs: 1,
      activeBombs: 0
    });

    this.players.set('player3', {
      id: 'player3',
      type: 'player',
      position: { x: 1, y: 13 },
      avatar: '/icons/Bomb2.png',
      keys: {up: 'i', down: 'k', left: 'j', right: 'l', bomb: 'm'},
      isAlive: true,
      lives: 3,
      maxBombs: 1,
      activeBombs: 0
    });

    this.players.set('player4', {
      id: 'player4',
      type: 'player',
      position: { x: 13, y: 13 },
      avatar: '/icons/BombNinja.png',
      keys: {up: 't', down: 'g', left: 'f', right: 'h', bomb: 'v'},
      isAlive: true,
      lives: 3,
      maxBombs: 1,
      activeBombs: 0
    });
  }

  private generateDestructibleBoxes() {
    // Define safe zones around player spawn points
    const safeZones = [
      // Player 1 safe zone (top-left)
      {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2},
      // Player 2 safe zone (top-right) 
      {x: 13, y: 1}, {x: 12, y: 1}, {x: 13, y: 2},
      // Player 3 safe zone (bottom-left)
      {x: 1, y: 13}, {x: 2, y: 13}, {x: 1, y: 12},
      // Player 4 safe zone (bottom-right)
      {x: 13, y: 13}, {x: 12, y: 13}, {x: 13, y: 12}
    ];

    const safeZoneStrings = new Set(safeZones.map(pos => `${pos.x},${pos.y}`));

    // Get all empty positions (not walls, not safe zones)
    const emptyPositions: Position[] = [];
    for (let y = 1; y < this.boardSize.height - 1; y++) {
      for (let x = 1; x < this.boardSize.width - 1; x++) {
        const posStr = `${x},${y}`;
        if (!this.walls.has(posStr) && !safeZoneStrings.has(posStr)) {
          emptyPositions.push({x, y});
        }
      }
    }

    // Randomly place boxes on ~90% of empty positions
    const boxCount = Math.floor(emptyPositions.length * 0.9);
    const shuffledPositions = [...emptyPositions].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < boxCount; i++) {
      const pos = shuffledPositions[i];
      this.destructibleBoxes.add(`${pos.x},${pos.y}`);
    }

    console.log(`🟫 Generated ${boxCount} destructible boxes out of ${emptyPositions.length} possible positions`);
  }

  // Pure functions - no side effects
  canMoveTo(x: number, y: number, excludePlayerId?: string): boolean {
    if (x < 0 || x >= this.boardSize.width || y < 0 || y >= this.boardSize.height) {
      return false;
    }

    if (this.walls.has(`${x},${y}`)) {
      return false;
    }

    // Check for destructible boxes
    if (this.destructibleBoxes.has(`${x},${y}`)) {
      return false;
    }

    // Check for fire - players can't walk through fire!
    if (this.fires.has(`${x},${y}`)) {
      return false;
    }

    // Check for other players - but only alive players should block movement
    const playersList = Array.from(this.players.values());
    for (const player of playersList) {
      if (player.id !== excludePlayerId && 
          player.isAlive && 
          player.position.x === x && 
          player.position.y === y) {
        return false;
      }
    }

    // Bomb collision logic: allow player to stand on their own bomb, but not walk onto any bomb after leaving it
    // Find if there is a bomb at the target position
    const bombAtTarget = Array.from(this.bombs.values()).find(bomb => bomb.position.x === x && bomb.position.y === y);
    if (bombAtTarget) {
      // Get the player trying to move
      if (excludePlayerId) {
        const player = this.players.get(excludePlayerId);
        if (player) {
          // If player is currently standing on the bomb, allow movement (i.e., moving off the bomb)
          if (player.position.x === x && player.position.y === y) {
            return true;
          }
        }
      }
      // Otherwise, block movement onto bombs
      return false;
    }

    return true;
  }

  movePlayer(playerId: string, direction: string): boolean {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) return false;

    let newX = player.position.x;
    let newY = player.position.y;

    switch (direction) {
      case player.keys.up: newY--; break;
      case player.keys.down: newY++; break;
      case player.keys.left: newX--; break;
      case player.keys.right: newX++; break;
      case player.keys.bomb: 
        this.plantBomb(playerId);
        return true;
      default: return false;
    }

    if (this.canMoveTo(newX, newY, playerId)) {
      player.position = { x: newX, y: newY };
      return true;
    }
    return false;
  }

  plantBomb(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) return;

    // Check if player has reached their bomb limit
    if (player.activeBombs >= player.maxBombs) {
      console.log(`💣 ${playerId} cannot plant more bombs (${player.activeBombs}/${player.maxBombs})`);
      return;
    }

    const bombId = `bomb_${playerId}_${Date.now()}`;
    const bomb: BombEntity = {
      id: bombId,
      type: 'bomb',
      position: { ...player.position },
      owner: playerId,
      timer: 2000
    };

    this.bombs.set(bombId, bomb);
    
    // Increment the player's active bomb count
    player.activeBombs++;
    console.log(`💣 ${playerId} planted bomb (${player.activeBombs}/${player.maxBombs})`);

    // Schedule explosion
    setTimeout(() => {
      this.explodeBomb(bombId);
    }, 2000);
  }

  private explodeBomb(bombId: string): void {
    const bomb = this.bombs.get(bombId);
    if (!bomb) return;

    // Decrement the owner's active bomb count
    const owner = this.players.get(bomb.owner);
    if (owner && owner.activeBombs > 0) {
      owner.activeBombs--;
      console.log(`💥 ${bomb.owner} bomb exploded (${owner.activeBombs}/${owner.maxBombs})`);
    }

    this.bombs.delete(bombId);

    // Add fire in cross pattern
    const firePositions = this.calculateFirePositions(bomb.position.x, bomb.position.y);
    firePositions.forEach(pos => {
      this.fires.add(`${pos.x},${pos.y}`);
    });

    // Check for players caught in the explosion and kill them
    this.checkPlayersInFire(firePositions);

    // Clear fire after 2 seconds
    setTimeout(() => {
      firePositions.forEach(pos => {
        this.fires.delete(`${pos.x},${pos.y}`);
      });
    }, 2000);
  }

  private calculateFirePositions(x: number, y: number): Position[] {
    // Create a simple board representation for the Bomb class
    const simpleBoard = Array(this.boardSize.height).fill(null).map(() => 
      Array(this.boardSize.width).fill(null)
    );

    // Mark walls in the simple board
    this.walls.forEach(wallCoord => {
      const [wx, wy] = wallCoord.split(',').map(Number);
      simpleBoard[wy][wx] = 'wall';
    });

    // Mark destructible boxes as obstacles that stop fire but get destroyed
    this.destructibleBoxes.forEach(boxCoord => {
      const [bx, by] = boxCoord.split(',').map(Number);
      simpleBoard[by][bx] = 'box';
    });

    // Calculate fire manually to handle box destruction
    const firePositions: Position[] = [{ x, y }]; // Center explosion
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // down, up, right, left

    for (const [dx, dy] of directions) {
      for (let i = 1; i <= 2; i++) { // Fire range of 2
        const nx = x + dx * i;
        const ny = y + dy * i;
        
        // Check bounds
        if (nx < 0 || nx >= this.boardSize.width || ny < 0 || ny >= this.boardSize.height) {
          break;
        }
        
        // Check for walls - stop fire completely
        if (simpleBoard[ny][nx] === 'wall') {
          break;
        }
        
        // Check for destructible boxes
        if (simpleBoard[ny][nx] === 'box') {
          // Add this position to fire (to destroy the box)
          firePositions.push({ x: nx, y: ny });
          // Destroy the box
          this.destructibleBoxes.delete(`${nx},${ny}`);
          // Stop fire from continuing past this box
          break;
        }
        
        // Empty space - fire continues
        firePositions.push({ x: nx, y: ny });
      }
    }

    return firePositions;
  }

  private checkPlayersInFire(firePositions: Position[]): void {
    // Check each player to see if they're caught in the fire
    const playersList = Array.from(this.players.values());
    for (const player of playersList) {
      if (!player.isAlive) continue;

      const playerInFire = firePositions.some(
        firePos => firePos.x === player.position.x && firePos.y === player.position.y
      );

      if (playerInFire) {
        this.killPlayer(player.id);
      }
    }
  }

  private killPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.isAlive = false;
    player.lives--;

    console.log(`💀 ${playerId} died! Lives remaining: ${player.lives}`);

    // Respawn after 3 seconds if they have lives left
    if (player.lives > 0) {
      setTimeout(() => {
        this.respawnPlayer(playerId);
      }, 3000);
    } else {
      console.log(`🏁 ${playerId} is eliminated! Game Over for this player.`);
    }
  }

  private respawnPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    // Reset bomb count on respawn
    player.activeBombs = 0;

    // Define original spawn positions for each player
    const originalPositions = {
      'player1': { x: 1, y: 1 },    // Top-left
      'player2': { x: 13, y: 1 },   // Top-right
      'player3': { x: 1, y: 13 },   // Bottom-left
      'player4': { x: 13, y: 13 }   // Bottom-right
    };

    const originalPos = originalPositions[playerId as keyof typeof originalPositions];
    
    // Check if original position is safe to spawn
    if (this.canMoveTo(originalPos.x, originalPos.y, playerId)) {
      player.position = { ...originalPos };
      player.isAlive = true;
      console.log(`🔄 ${playerId} respawned at original position (${originalPos.x}, ${originalPos.y})`);
    } else {
      // If original position is not safe, force respawn there anyway
      // This handles cases where there might be fire or temporary obstacles
      player.position = { ...originalPos };
      player.isAlive = true;
      console.log(`🔄 ${playerId} force respawned at original position (${originalPos.x}, ${originalPos.y}) - position was occupied`);
    }
  }

  // Get alive players only for rendering
  getAlivePlayers(): PlayerEntity[] {
    return Array.from(this.players.values()).filter(player => player.isAlive);
  }

  // Get all players (for UI display of lives, etc.)
  getAllPlayers(): PlayerEntity[] {
    return Array.from(this.players.values());
  }

  getBombs(): BombEntity[] {
    return Array.from(this.bombs.values());
  }

  getFires(): Position[] {
    return Array.from(this.fires).map(coordStr => {
      const [x, y] = coordStr.split(',').map(Number);
      return { x, y };
    });
  }

  getWalls(): Position[] {
    return Array.from(this.walls).map(coordStr => {
      const [x, y] = coordStr.split(',').map(Number);
      return { x, y };
    });
  }

  getDestructibleBoxes(): Position[] {
    return Array.from(this.destructibleBoxes).map(coordStr => {
      const [x, y] = coordStr.split(',').map(Number);
      return { x, y };
    });
  }

  getBoardSize() {
    return this.boardSize;
  }
}
