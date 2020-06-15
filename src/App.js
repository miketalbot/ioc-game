import React from "react"
import "./styles.css"
import { raise } from "./lib/event-bus"
import { GameSurface } from "./game/game-surface"

import "./game"

export default function App() {
    const [uiElements] = raise("ui", [])
    return (
        <div className="App">
            <GameSurface>{uiElements}</GameSurface>
        </div>
    )
}
