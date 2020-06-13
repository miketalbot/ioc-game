import React from "react"
import { update } from "js-coroutines"
import { Box } from "@material-ui/core"
import { RiverBank } from "./riverbank"
import { raise, using } from "../lib/event-bus"

function sortByExtraction(fn) {
    return function(a, b) {
        const va = fn(a)
        const vb = fn(b)
        return vb > va ? -1 : va === vb ? 0 : 1
    }
}

const inPriorityOrder = sortByExtraction(v => v.priority || 0)

function* standardPlayer(getPosition, playing) {
    yield* using(function*(on) {
        on("startGame", () => (playing = true))
        on("endGame", () => (playing = false))
        let lx = undefined
        let ly = undefined
        while (true) {
            yield
            if (!playing) continue
            const { x, y, time } = getPosition()
            if (time > 500) {
                lx = undefined
                ly = undefined
            }
            lx = lx || x
            ly = ly || y
            let dx = x - lx
            let dy = y - ly
            let distance = Math.sqrt(dx ** 2 + dy ** 2)
            lx = x
            ly = y
            raise("player", { x, y, dx, dy, distance })
        }
    })
}

export function GameSurface({ children }) {
    const ref = React.useRef()
    const [elements] = React.useState(() => {
        const [elements] = raise("initialize", { game: [], top: [] })
        elements.game.sort(inPriorityOrder)
        elements.top.sort(inPriorityOrder)
        return elements
    })
    let x = 0
    let y = 0
    let lastTime = Date.now()
    React.useEffect(() => {
        return update(standardPlayer(getPosition)).terminate
    })
    return (
        <Box position="relative">
            <svg
                viewBox="0 0 1000 700"
                width="100%"
                style={{ background: "lightblue", position: "relative" }}
            >
                <RiverBank>{elements.game}</RiverBank>
                {elements.top}
            </svg>
            <Box
                ref={ref}
                onTouchMove={captureTouch}
                onMouseMove={captureMouse}
                position="absolute"
                left={0}
                top={0}
                right={0}
                bottom={0}
            >
                {children}
            </Box>
        </Box>
    )

    function captureTouch(event) {
        lastTime = Date.now()
        const p = ref.current.offsetWidth / 1000
        const rect = ref.current.getBoundingClientRect()
        x = (event.targetTouches[0].clientX - rect.left) / p
        y = (event.targetTouches[0].clientY - rect.top) / p
    }

    function captureMouse(event) {
        lastTime = Date.now()
        const p = ref.current.offsetWidth / 1000
        const rect = ref.current.getBoundingClientRect()
        x = (event.clientX - rect.left) / p
        y = (event.clientY - rect.top) / p
    }

    function getPosition() {
        return { x, y, time: Date.now() - lastTime }
    }
}
