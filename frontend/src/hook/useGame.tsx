import { useState } from "react";
import Player from "../classes/Player";

export function useGame() {
    const [players, setPlayers] = useState({
        player1: new Player({up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', bomb: 'Enter'}, 'player1', "/icons/BombSamurai.png"),
        player2: new Player({up: 'w', down: 's', left: 'a', right: 'd', bomb: ' '}, 'player2', "/icons/BombKnight.png"),
        player3: new Player({up: 'i', down: 'k', left: 'j', right: 'l', bomb: 'm'}, 'player3', "/icons/Bomb2.png"),
        player4: new Player({up: 't', down: 'g', left: 'f', right: 'h', bomb: 'v'}, 'player4', "/icons/BombNinja.png")
    });

    const initialBoard = [
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
        ["wall", players.player1.id, null, null, null, null, null, null, null, null, null, null, null, players.player2.id, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", null, null, null, null, null, null, null, null, null, null, null, null, null, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", null, null, null, null, null, null, null, null, null, null, null, null, null, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", null, null, null, null, null, null, null, null, null, null, null, null, null, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", null, null, null, null, null, null, null, null, null, null, null, null, null, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", null, null, null, null, null, null, null, null, null, null, null, null, null, "wall"],
        ["wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall", null, "wall"],
        ["wall", players.player3.id, null, null, null, null, null, null, null, null, null, null, null, players.player4.id, "wall"],
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ]

    const [board, setBoard] = useState<("wall" | any)[][]>(initialBoard);

    return { board, setBoard, players, setPlayers };
}