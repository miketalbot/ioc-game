import React from "react"
import "./styles.css"
import { raise } from "./lib/event-bus"
import { GameSurface } from "./game/game-surface"

//Core requirements for the game / menus etc
import "./game"

//Plug ins
import "./game/apple"
import "./game/bottle"
import "./game/bubble"
import "./game/ui/score"
import "./game/utilities/ripple"

// These levels require apples, bottles and bubbles
// if commented out the auto levels will adjust if they are
// missing
import "./game/levels/level-definitions"

export default function App() {
    const [uiElements] = raise("ui", [])
    return (

        <div className="App">
            <GameSurface>{uiElements}</GameSurface>
        </div>
    )
}
