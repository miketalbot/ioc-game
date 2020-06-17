import React from "react"
import { Pool } from "../../lib/pool"
import { handle } from "../../lib/event-bus"
import { update } from "js-coroutines"
import { interpolate, Vector, ease } from "../../lib/math"

const Text = React.forwardRef(function Text(props, ref) {
    let x = -1000
    let y = -1000
    let _scale = 0
    let _opacity = 0
    let _rotation = 0
    let _text = ""
    let _color = ""
    let shownOpacity = 0
    return (
        <g opacity={0} ref={addRef}>
            <text />
        </g>
    )

    function addRef(value) {
        if (!value) return
        let text = {
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
            rotation(value) {
                if (value === undefined) return _rotation
                _rotation = value
            },
            color(update) {
                if (!update) return _color
                value.children[0].setAttribute(
                    "style",
                    `fill: ${update}; text-anchor: middle`
                )
                _color = update
            },
            text(update) {
                if (!update) return _text
                value.children[0].textContent = update
                _text = update
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
                    `translate(${x}, ${y}) scale(${_scale}) rotate(${_rotation})`
                )
            }
        }
        if (ref) {
            ref(text)
        }
    }
})

const texts = new Pool(Text, 50)

handle("initialize", function ({ game, top }) {
    texts.elements.priority = 20
    top.push(texts.elements)
})

export function floatText(
    x,
    y,
    text,
    color = "white",
    duration = 2,
    scale = 1
) {
    const floater = texts.get()
    if (floater) {
        update(float(floater, x, y, text, color, duration, scale))
    }
}

let last = 0
export function cascadeText({
    x,
    y,
    number = 8,
    minAngle = 0,
    maxAngle = Math.PI * 2,
    text = "⭑",
    color = "#C5B358",
    duration = 2,
    scale = 2,
    speed = 250,
    offset = Math.random()
}) {
    if (Date.now() - last < 100) return
    last = Date.now()
    for (
        let i = minAngle + offset;
        i < maxAngle + offset;
        i += (maxAngle - minAngle) / number
    ) {
        let v = new Vector(Math.sin(i), Math.cos(i)).scale(speed / 60)
        const floater = texts.get()
        if (floater) {
            update(cascade(floater, x, y, v, text, color, duration, scale))
        }
    }
}

function* cascade(floater, x, y, v, text, color, duration, scale) {
    let r = Math.random() * 20
    x += v.x
    y += v.y
    floater.move(x, y)
    floater.scale(0)
    floater.rotation(r)
    floater.show(true)
    floater.text(text)
    floater.color(color)
    floater.opacity(0)
    floater.update()
    for (let i = 0; i < 1; i += 60 / (duration * 1000)) {
        x += v.x
        y += v.y
        floater.rotation((r += 3))
        floater.move(x, y)
        floater.opacity(interpolate(1, 0, ease(i)))
        floater.scale(interpolate(scale, 2 * scale, ease(i)))
        floater.update()
        yield
    }
    floater.return()
    floater.update()
}

function* float(floater, x, y, text, color, duration, scale) {
    floater.move(x, y)
    floater.scale(0)
    floater.rotation(0)
    floater.show(true)
    floater.text(text)
    floater.color(color)
    floater.opacity(0)
    floater.update()
    for (let i = 0; i < 1; i += 60 / (duration * 1000)) {
        floater.move(x, y - ease(i) * 60)
        floater.opacity(interpolate(1, 0, ease(i)))
        floater.scale(scale * interpolate(1, 2, ease(i)))
        floater.update()
        yield
    }
    floater.return()
    floater.update()
}
