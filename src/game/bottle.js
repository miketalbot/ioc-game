import React from "react"
import { update } from "js-coroutines"
import bottle from "../assets/bottle.png"
import shadow from "../assets/bottle-shadow.png"
import { clamp, interpolate } from "../lib/math"
import { ensureArray, handle, raise, raiseLater, using } from "../lib/event-bus"
import { Pool } from "../lib/pool"

let id = 0
const Bottle = React.forwardRef(function Apple({ x = 0, y = 0 }, ref) {
    const key = id++
    return (
        <g opacity={1} ref={addRef} id={`bottle${key}`}>
            <image href={shadow} x={10} y={-90} width={400} />
            <image href={bottle} x={0} y={-100} width={400} />
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
                if (sign !== lastSign && visible) {
                    raiseLater("bob", bottle)
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
                for (let x = 150; x < 370; x += 60) {
                    location.x = bottle.x + x
                    location.y = bottle.y
                    location.radius = 85
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
                    `translate(${x | 0},${y | 0}) scale(${interpolate(
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

const bottles = new Pool(Bottle, 4)

export function getBottle() {
    return bottles.get()
}

handle("initializeLevel", function (levelSpec) {
    levelSpec.bottleFixed = []
    let bottles = (2 + Math.random() * 3) | 0
    let bottleStart = (Math.random() * 1100) | 0
    for (let i = 0; i < bottles; i++) {
        levelSpec.bottleFixed.push({
            x: bottleStart,
            y: 150 + Math.random() * 500,
            speed: 0.25 + Math.random() / 9
        })
        bottleStart += (500 + Math.random() * 300) | 0
    }
})

handle("getLevelAllocators", function (allocators, levelSpec) {
    let bubble = 0
    allocators.push(function (step) {
        const amount = ((Math.random() * 5) | 0) * 5 + 10
        if (bubble + amount > levelSpec.bottleFixed.length * 25) return false
        bubble += amount
        step.bubbles = amount
    })
})

//Put apples in the game
handle("initialize", function ({ game }) {
    game.push(bottles.elements)
})

function* moveBottle(bottle, speed) {
    yield* using(function* (on) {
        let stop = false
        on("endLevel", () => (stop = true))
        for (let x = bottle.x; !stop && x > -500; x -= speed) {
            bottle.move(x, bottle.y)
            yield
        }
        bottle.return()
    })
}

export function driftBottle(
    x = 1020,
    y = Math.random() * 400 + 200,
    speed = 0.5
) {
    let bottle = getBottle()
    if (bottle) {
        bottle.move(x, y)
        bottle.show(true)
        update(moveBottle(bottle, speed))
    }
}

handle("prepareLevel", ({ bottleFixed }) => {
    for (let fixed of ensureArray(bottleFixed)) {
        driftBottle(fixed.x, fixed.y, fixed.speed)
    }
})
