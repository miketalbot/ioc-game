import React from "react"
import "./styles.css"
import { Container } from "@material-ui/core"
import { raise } from "./lib/event-bus"
import { GameSurface } from "./game/game-surface"

import "./game"

export default function App() {
    const [uiElements] = raise("ui", [])
    return (
        <div className="App">
            <Container>
                <GameSurface>{uiElements}</GameSurface>
            </Container>
        </div>
    )
}
