import React from "react"
import ripple from "../../assets/wripple2.png"
import { Pool } from "../../lib/pool"
import { handle } from "../../lib/event-bus"
import { update } from "js-coroutines"
import { interpolate } from "../../lib/math"

const Ripple = React.forwardRef(function Ripple(props, ref) {
    let x = -1000
    let y = -1000
    let _scale = 0
    let _opacity = 0
    let shownOpacity = 0
    return (
        <g opacity={0} ref={addRef}>
            <image href={ripple} width={100} x={-50} y={-50} />
        </g>
    )

    function addRef(value) {
        if (!value) return
        let ripple = {
            move(nx, ny) {
                if (nx === undefined) {
                    return { x, y }
                }
                x = nx
                y = ny
            },
            opacity(value) {
                if (!value) return _opacity
                _opacity = value
            },
            scale(value) {
                if (!value) return _scale
                _scale = value
            },
            show(value) {
                if (value === undefined) return !!shownOpacity
                shownOpacity = !!value ? 1 : 0
            },
            update() {
                value.setAttribute(
                    "display",
                    shownOpacity * _opacity > 0 ? "block" : "none"
                )
                value.setAttribute("opacity", shownOpacity * _opacity)
                value.setAttribute(
                    "transform",
                    `translate(${x|0}, ${y|0}) scale(${_scale})`
                )
            }
        }
        if (ref) {
            ref(ripple)
        }
    }
})

const ripples = new Pool(Ripple, 25)
let lastTime = 0

handle("initialize", function ({ game }) {
    ripples.elements.priority = -1
    game.push(ripples.elements)
})

handle("player", function ({ x, y, distance }) {
    if (Date.now() - lastTime < 100 && distance < 10) return
    lastTime = Date.now()
    if (distance > 2 && distance < 100) {
        const ripple = ripples.get()
        if (ripple) {
            update(playRipple(ripple, x, y, distance))
        }
    }
})

function* playRipple(ripple, x, y, distance) {
    ripple.move(x, y)
    ripple.show(true)
    distance = Math.max(distance, 13)
    for (let t = 0; t < 1; t += 0.02) {
        ripple.scale(interpolate(distance / 200, distance / 15, t))
        ripple.opacity(1 - t)
        ripple.update()
        yield
    }
    ripple.return()
}
