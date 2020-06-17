import React from "react"
import { update } from "js-coroutines"
import { Box } from "@material-ui/core"
import { RiverBank } from "./riverbank"
import { raise, useEvent, using } from "../lib/event-bus"
import { inPriorityOrder } from "../lib/sort"

function* standardPlayer(getPosition, playing) {
    yield* using(function* (on) {
        on("startLevel", () => (playing = true))
        on("endLevel", () => (playing = false))
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
    const [windowWidth, setWidth] = React.useState(window.innerWidth)
    const playing = React.useRef(false)
    const ref = React.useRef()
    const [elements] = React.useState(() => {
        const [elements] = raise("initialize", { game: [], top: [] })
        elements.game.sort(inPriorityOrder)
        elements.top.sort(inPriorityOrder)
        return elements
    })
    React.useEffect(() => {
        window.addEventListener("resize", updateWidth)
        return () => {
            window.removeEventListener("resize", updateWidth)
        }
        function updateWidth() {
            setWidth(window.innerWidth)
        }
    }, [])
    useEvent("startLevel", () => (playing.current = true))
    useEvent("endLevel", () => (playing.current = false))

    let ratio = Math.max(1, 1000 / windowWidth)
    let height = Math.min(window.innerHeight, 700 / ratio)
    let width = (height / 700) * 1000
    let offset = (windowWidth - width) / 2
    let x = 0
    let y = 0
    let lastTime = Date.now()
    React.useEffect(() => {
        return update(standardPlayer(getPosition, playing.current)).terminate
    })
    return (
        <Box
            ref={ref}
            onTouchStart={startTouch}
            onTouchMove={captureTouch}
            onMouseMove={captureMouse}
            position="relative"
            width={width}
            style={{ marginLeft: offset }}
        >
            <svg
                viewBox="0 0 1000 700"
                width={width}
                style={{ background: "lightblue", position: "relative" }}
            >
                <RiverBank>{elements.game}</RiverBank>
                {elements.top}
            </svg>
            <Box
                position="absolute"
                style={{ zoom: 1 / ratio }}
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
        event.stopPropagation()
        event.preventDefault()
        lastTime = Date.now()
        const rect = ref.current.getBoundingClientRect()
        const p = width / 1000
        x = (event.targetTouches[0].clientX - rect.left) / p
        y = (event.targetTouches[0].clientY - rect.top) / p
    }

    function startTouch() {
        lastTime = 0
    }

    function captureMouse(event) {
        lastTime = Date.now()
        const p = width / 1000
        const rect = ref.current.getBoundingClientRect()

        x = (event.clientX - rect.left) / p
        y = (event.clientY - rect.top) / p
    }

    function getPosition() {
        return { x, y, time: Date.now() - lastTime }
    }
}
