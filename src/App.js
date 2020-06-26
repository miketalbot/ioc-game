import React from "react"
import "./styles.css"
import { raise, raiseAsync } from "./lib/event-bus"
import { GameSurface } from "./game/game-surface"
import { parse } from "query-string"

//Core requirements for the game / menus etc
import "./game"

//Plug ins
import "./game/apple"
import "./game/bottle"
import "./game/bubble"
import "./game/ui/score"
import "./game/utilities/ripple"
import "./lib/file-loader"
import "./powered-by.js"

// These levels require apples, bottles and bubbles
// if commented out the auto levels will adjust if they are
// missing
import "./game/levels/level-definitions"

if (!window.location.search) {
    window.location.search =
        "load=music.js&load=ambient-sounds.js&load=bubble-sounds.js&load=apple-sounds.js&load=level-sounds.js"
}

export default function App() {
    const [ready, setReady] = React.useState(false)
    const loaded = React.useRef(true)
    React.useEffect(() => {
        start().catch(console.error)
        return () => {
            loaded.current = false
        }
    }, [])
    if (ready) {
        const [uiElements] = raise("ui", [])
        return (
            <div className="App">
                <GameSurface>{uiElements}</GameSurface>
            </div>
        )
    } else {
        return null
    }

    async function start() {
        const parameters = parse(window.location.search)
        await raiseAsync("initializeGame", parameters)
        await raiseAsync("postInitializeGame", parameters)
        await raiseAsync("gameReady", parameters)
        if (loaded.current) {
            setReady(true)
        }
    }
}
