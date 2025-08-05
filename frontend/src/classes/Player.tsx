import Bomb from "./Bomb";

export default class Player {
    keys: { up: string, down: string, left: string, right: string, bomb: string };
    bombs: number;
    id: string;
    avatar: string;

    constructor(keys: {up: string, down: string, left: string, right: string, bomb: string}, id: string, avatar: string) {
        this.keys = keys;
        this.bombs = 0;
        this.id = id;
        this.avatar = avatar;
    }

    // Check if a position is valid (not a wall and within bounds)
    canMoveTo(board: ("wall" | any)[][], newX: number, newY: number): boolean {
        // Check bounds
        if (newX < 0 || newX >= board[0].length || newY < 0 || newY >= board.length) {
            return false;
        }
        
        // Check if it's a wall
        if (board[newY][newX] === 'wall') {
            return false;
        }
        
        // Check if there's another player (optional - you might want to allow this)
        if (board[newY][newX] !== null && board[newY][newX] !== 'wall') {
            return false;
        }
        return true;
    }

    // Move the player on the board
    move(
        board: ("wall" | any)[][],
        direction: string,
        updateBoard: (
            fn: (prevBoard: (string | { type: string; owner?: string })[][]) => (string | { type: string; owner?: string })[][]
        ) => void
    ) {
        // Find current position of this player on the board
        let oldX = -1, oldY = -1;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x] === this.id) {
                    oldX = x;
                    oldY = y;
                    break;
                }
            }
            if (oldX !== -1) break;
        }
        if (oldX === -1 || oldY === -1) return; // Not found

        let newX = oldX;
        let newY = oldY;
        switch (direction) {
            case this.keys.up:
                newY = oldY - 1;
                break;
            case this.keys.down:
                newY = oldY + 1;
                break;
            case this.keys.left:
                newX = oldX - 1;
                break;
            case this.keys.right:
                newX = oldX + 1;
                break;
            case this.keys.bomb:
                this.plantBomb(board, updateBoard);
                return; // Bomb planting doesn't move the player
            default:
                return; // Invalid direction
        }
        // Check if the move is valid and actually different from current position
        if (this.canMoveTo(board, newX, newY) && (newX !== oldX || newY !== oldY)) {
            // Update the board state using a function as expected by plantBomb
            updateBoard((prevBoard) => {
                const newBoard = prevBoard.map(row => [...row]);
                // Remove player from old position
                newBoard[oldY][oldX] = "";
                // Place player in new position
                newBoard[newY][newX] = this.id;
                return newBoard;
            });
        }
    }

    plantBomb(
        board: (string | { type: string; owner?: string })[][],
        updateBoard: (fn: (prevBoard: (string | { type: string; owner?: string })[][]) => (string | { type: string; owner?: string })[][]) => void
    ) {
        // Find current position of this player on the board
        let x = -1, y = -1;
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                if (board[row][col] === this.id) {
                    x = col;
                    y = row;
                    break;
                }
            }
            if (x !== -1) break;
        }
        if (x === -1 || y === -1) return;

        // Only plant if cell is empty (should always be true for player position)
        updateBoard((prevBoard: (string | { type: string; owner?: string })[][]) => {
            if (prevBoard[y][x] !== this.id) return prevBoard;
            const newBoard = prevBoard.map(row => [...row]);
            newBoard[y][x] = { type: "bomb", owner: this.id };
            return newBoard;
        });

        // After 2s, explode bomb
        setTimeout(() => {
            updateBoard((prevBoard: (string | { type: string; owner?: string })[][]) => {
                const cell = prevBoard[y][x];
                if (!cell || !(typeof cell === 'object' && cell.type === "bomb")) return prevBoard;
                // Cast board for fire propagation (ignore bomb/fire cells)
                const castBoard = prevBoard.map(row => row.map(cell => (typeof cell === 'string' || cell === null) ? cell : null)) as (string | null)[][];
                const fireCoords = Bomb.getFireCross(x, y, castBoard);
                const newBoard = prevBoard.map(row => [...row]);
                for (const [fx, fy] of fireCoords) {
                    if (newBoard[fy][fx] !== 'wall') {
                        newBoard[fy][fx] = { type: "fire" };
                    }
                }
                return newBoard;
            });
            // After another 2s, clear fire
            setTimeout(() => {
                updateBoard((prevBoard: (string | { type: string; owner?: string })[][]) => {
                    const newBoard = prevBoard.map(row => [...row]);
                    for (let fy = 0; fy < newBoard.length; fy++) {
                        for (let fx = 0; fx < newBoard[fy].length; fx++) {
                            const cell = newBoard[fy][fx];
                            if (typeof cell === 'object' && cell !== null && cell.type === "fire") {
                                newBoard[fy][fx] = null as any;
                            }
                        }
                    }
                    return newBoard;
                });
            }, 2000);
        }, 2000);
    }
}