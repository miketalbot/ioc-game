import React from "react"
import { update } from "js-coroutines"
import bubble from "../assets/bubble.png"
import { clamp, interpolate } from "../lib/math"
import { handle, raiseLater, using } from "../lib/event-bus"
import { Pool } from "../lib/pool"
import './bubble-ui'

let id = 0
const Bubble = React.forwardRef(function Apple({ x = 0, y = 0 }, ref) {
    const key = id++
    return (
        <g opacity={1} ref={addRef} id={`bubble${key}`}>
            <image
                href={bubble}
                x={-125}
                y={-125}
                width={250}
                opacity={0.8}
            />
        </g>
    )

    function addRef(element) {
        let visible = false
        let setInvisible = false
        let bubble
        let scaleX = 1
        let scaleY = 1
        let _scale = 1
        let _opacity = 1
        if (element) {
            bubble = Object.defineProperties(
                {
                    element,
                    key,
                    move,
                    update: updateSvgElement,
                    show,
                    scale,
                    opacity
                },
                {
                    x: {
                        get() {
                            return x
                        }
                    },
                    y: {
                        get() {
                            return y
                        }
                    }
                }
            )
            element._key = key
            ref && ref(bubble)
            updateSvgElement()
            update(process(bubble))
        }

        function opacity(value) {
            if (value === undefined) {
                return _opacity
            }
            _opacity = value
        }

        function scale(value) {
            if (value === undefined) return _scale
            _scale = value
        }

        function* process(bubble) {
            let angle = Math.random() * Math.PI * 2
            while (true) {
                scaleX = 1 + Math.sin(angle) * 0.05
                scaleY = 1 + Math.cos(angle) * 0.05
                angle += 0.06
                bubble.update()
                yield
            }
        }

        function updateSvgElement() {
            if (!visible) {
                if (setInvisible) return
                setInvisible = true
                element.setAttribute("display", "none")
            } else {
                if (setInvisible) {
                    element.setAttribute("display", "block")
                    setInvisible = false
                }
                element.setAttribute("opacity", _opacity)
                element.setAttribute(
                    "transform",
                    `translate(${x|0},${y|0}) scale(${(_scale * scaleX)} ${
                        (_scale * scaleY)
                    })`
                )
            }
        }
        function show(newVisible) {
            visible = newVisible
        }

        function move(nx, ny) {
            x = nx
            y = ny
        }
    }
})

const bubbles = new Pool(Bubble, 70)

export function makeBubble(x, y, scale) {
    let bubble = bubbles.get()
    if (bubble) {
        bubble.move(x, y)
        bubble.scale(scale)
        update(moveBubble(bubble))
    }
}

//Put apples in the game
handle("initialize", function ({ top }) {
    top.push(bubbles.elements)
})

handle("bob", function (bottle) {
    if (bottle.x < 10 || bottle.x > 990) return
    for (let i = 0; i < Math.random() * 3; i++) {
        makeBubble(
            bottle.x + 20 + Math.random() * 5,
            bottle.y - 40 + Math.random() * 50,
            0.1 + Math.random() * 0.2
        )
    }
})

const EFFECTIVE_DISTANCE = 130

function* moveBubble(bubble) {
    return yield* using(function* (on) {
        on("player", updatePlayerPosition)
        on("endLevel", () => (stop = true))
        let distanceToCursor = Infinity
        let stop = false
        let bx = bubble.x
        let by = bubble.y
        let ox = bx
        let oy = by
        let dx = Math.random() * 0.15
        let dy = Math.random() * 0.3 - 0.15
        let size = bubble.scale()
        bubble.scale(0)
        bubble.update()
        bubble.show(true)
        let x = 0
        let y = 0
        bubble.opacity(1)
        let scaleMultipler = 0
        let distanceFromStart = 0
        //Move bubbles away from mouse
        do {
            scaleMultipler = interpolate(scaleMultipler, 1, 0.02)
            ox += dx
            oy += dy
            dx *= 1.007
            dy *= 1.007
            bx = interpolate(bx, ox, 0.03)
            by = interpolate(by, oy, 0.03)
            distanceToCursor = Math.sqrt((bx - x) ** 2 + (by - y) ** 2)
            distanceFromStart = Math.sqrt((bx - ox) ** 2 + (by - oy) ** 2)
            bubble.scale(
                clamp(scaleMultipler) *
                    (size + (size * 2 * distanceFromStart) / EFFECTIVE_DISTANCE)
            )

            if (distanceToCursor < EFFECTIVE_DISTANCE) {
                let vx = (bx - x) / distanceToCursor
                let vy = (by - y) / distanceToCursor
                bx +=
                    ((vx * (EFFECTIVE_DISTANCE - distanceToCursor)) /
                        EFFECTIVE_DISTANCE) *
                    10 *
                    scaleMultipler
                by +=
                    ((vy * (EFFECTIVE_DISTANCE - distanceToCursor)) /
                        EFFECTIVE_DISTANCE) *
                    10 *
                    scaleMultipler
            }
            bubble.move(bx, by)
            yield
        } while (distanceToCursor > 25 && distanceFromStart < 140 && !stop)
        if (distanceToCursor <= 25) {
            raiseLater("popped", bubble)
            for (let opacity = 1; opacity >= 0; opacity -= 0.06) {
                bubble.scale(bubble.scale() * 1.15)
                bubble.opacity(opacity)
                yield
            }
        } else {
            for (let opacity = 1; opacity >= 0; opacity -= 0.08) {
                bx += dx
                by += dy
                dx *= 1.007
                dy *= 1.007

                bubble.move(bx, by)
                bubble.opacity(opacity)
                yield
            }
        }
        //Pop the bubble if we are too close

        bubble.return()

        function updatePlayerPosition({ x: nx, y: ny }) {
            x = nx
            y = ny
        }
    })
}

