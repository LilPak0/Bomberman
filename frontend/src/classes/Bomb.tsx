export default class Bomb {
    x: number;
    y: number;
    owner: string;

    constructor(x: number, y: number, owner: string) {
        this.x = x;
        this.y = y;
        this.owner = owner;
    }

    // Get fire cross positions (returns array of [x, y])
    static getFireCross(x: number, y: number, board: (string | null)[][], range: number = 2) {
        const fire: [number, number][] = [[x, y]];
        const directions = [
            [0, 1],  // down
            [0, -1], // up
            [1, 0],  // right
            [-1, 0], // left
        ];
        for (const [dx, dy] of directions) {
            for (let i = 1; i <= range; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (
                    ny < 0 || ny >= board.length ||
                    nx < 0 || nx >= board[0].length ||
                    board[ny][nx] === 'wall'
                ) {
                    break;
                }
                fire.push([nx, ny]);
            }
        }
        return fire;
    }
}