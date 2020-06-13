import React from "react"
import { update, run } from "js-coroutines"
import bottle from "../assets/bottle.png"
import { clamp, interpolate } from "../lib/math"
import { raise, handle } from "../lib/event-bus"
import { Pool } from "../lib/pool"

let id = 0
const Bottle = React.forwardRef(function Apple({ x = 0, y = 0 }, ref) {
    const key = id++
    return (
        <g opacity={1} ref={addRef} id={`bottle${key}`}>
            <image
                alt="bottle"
                href={bottle}
                x={10}
                y={-90}
                width={410}
                filter="url(#duotone)"
                opacity={0.3}
            />
            <image alt="bottle" href={bottle} x={0} y={-100} width={400} />
        </g>
    )

    function addRef(element) {
        let visible = false
        let bottle
        let bobDepth = 0
        if (element) {
            bottle = Object.defineProperties(
                {
                    element,
                    key,
                    move,
                    update: updateSvgElement,
                    show
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
            ref && ref(bottle)
            updateSvgElement()
            update(process(bottle))
        }

        function* process(bottle) {
            let angle = Math.random()
            let speed = 0.7
            let lastSign = 0
            while (true) {
                angle += (60 / 1000) * speed
                bobDepth = Math.sin(angle) + 1
                let sign = Math.sign(bobDepth - 1)
                if (sign !== lastSign) {
                    raise("bob", bottle)
                }
                lastSign = sign
                bottle.update()
                yield
            }
        }

        function updateSvgElement() {
            if (visible) {
                const location = {
                    x: bottle.x + 40,
                    y: bottle.y - 20,
                    radius: 30,
                    power: 1.4
                }
                raise("circle", location)
                for (let x = 150; x < 400; x += 100) {
                    location.x = bottle.x + x
                    location.y = bottle.y
                    location.radius = 90
                    raise("circle", location)
                }
            }

            if (!visible) {
                element.setAttribute("transform", `translate(-100000,-100000)`)
            } else {
                element.children[0].setAttribute("x", 15 - bobDepth * 3)
                element.children[0].setAttribute("y", -90 - bobDepth * 3)
                element.children[0].setAttribute("width", 410 - bobDepth * 3)
                element.setAttribute(
                    "transform",
                    `translate(${x},${y}) scale(${interpolate(
                        1,
                        0.92,
                        clamp(bobDepth / 2)
                    )}) rotate(${bobDepth - 1})`
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

const bottles = new Pool(Bottle, 3)

export function getBottle() {
    return bottles.get()
}

//Put apples in the game
handle("initialize", function({ game }) {
    game.push(bottles.elements)
})

let currentProcessor = null

handle("endGame", function() {
    if (currentProcessor) {
        currentProcessor.terminate()
        currentProcessor = null
    }
})

handle("startGame", async function() {
    currentProcessor = run(allocateBottles())
})

function* moveBottle(bottle) {
    for (let x = bottle.x; x > -500; x -= 0.5) {
        bottle.move(x, bottle.y)
        yield
    }
    bottle.return()
}

function* allocateBottles() {
    while (true) {
        yield new Promise(resolve =>
            setTimeout(resolve, 17000 + Math.random() * 15000)
        )
        let bottle = getBottle()
        if (bottle) {
            bottle.move(1000, Math.random() * 400 + 150)
            bottle.show(true)
            update(moveBottle(bottle))
        }
        yield true
    }
}
