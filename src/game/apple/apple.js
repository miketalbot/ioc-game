import React from "react"
import { update } from "js-coroutines"
import apple1 from "../../assets/apple1.png"
import apple2 from "../../assets/apple2.png"
import { clamp, interpolate } from "../../lib/math"
import { raise, handle } from "../../lib/event-bus"
import { Pool } from "../../lib/pool"

export { apple1, apple2 }

let id = 0
const Apple = React.forwardRef(function Apple({ x = 0, y = 0 }, ref) {
    const key = id++
    return (
        <g
            transform={`translate(${x}, ${y}) scale(0.5)`}
            opacity={1}
            ref={addRef}
            id={`apple${key}`}
        >
            <radialGradient id={`gradient${key}`}>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="32%" stopColor="#ffffff" />
                <stop offset="34%" stopColor="#bbbbbb" />
                <stop offset="82%" stopColor="#222222" />
                <stop offset="98%" stopColor="#000000" />
            </radialGradient>
            <mask id={`mask${key}`}>
                <rect
                    x={-100}
                    y={-100}
                    width="200"
                    height="200"
                    fill={`url(#gradient${key})`}
                />
            </mask>
            <image
                href={Math.random() > 0.5 ? apple1 : apple2}
                x={-100}
                y={-100}
                width={200}
                height={200}
                mask={`url(#mask${key})`}
            />
        </g>
    )

    function addRef(element) {
        let depth = 0
        let bobDepth = 0
        let scale = 0.5
        let rotation = Math.random() * 360
        let visible = false
        let naturalRotationSpeed = (Math.random() - 0.5) * 0.07
        let rotationSpeed = naturalRotationSpeed
        let apple
        let _rotate = false
        let _image = apple1

        if (element) {
            apple = Object.defineProperties(
                {
                    element,
                    key,
                    move,
                    start() {
                        update(bob(apple))
                    },
                    setDepth,
                    addRotation,
                    update: updateSvgElement,
                    show,
                    rotate,
                    color
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
                    },
                    radius: {
                        get() {
                            return scale * 100
                        }
                    }
                }
            )
            element._key = key
            element._gradient = Array.from(element.childNodes[0].children)
                .slice(1, -1)
                .map(node => node.attributes.offset)

            ref && ref(apple)
            updateSvgElement()
        }

        function addRotation(amount) {
            rotationSpeed += amount
        }

        function* bob(apple) {
            let angle = Math.random()
            let speed = Math.random() / 2
            while (true) {
                angle += (60 / 1000) * speed
                bobDepth = (Math.sin(angle) + 1) / 6
                apple.update()
                yield
            }
        }

        function updateSvgElement(updateElement = element) {
            if (visible) raise("circle", apple)
            const effectiveDepth = bobDepth + depth
            rotationSpeed = interpolate(
                rotationSpeed,
                naturalRotationSpeed,
                interpolate(0.01, 0.06, clamp(depth))
            )
            if (_rotate) rotation += rotationSpeed
            if (!visible) {
                updateElement.setAttribute("display", "none")
            } else {
                updateElement.setAttribute("display", "block")
                updateElement.setAttribute(
                    "transform",
                    `translate(${x},${y}) scale(${(scale = interpolate(
                        0.5,
                        0.4,
                        effectiveDepth
                    ))}) rotate(${rotation})`
                )
                updateElement._gradient[0].value = `${interpolate(
                    75,
                    10,
                    clamp(effectiveDepth)
                )}%`
                updateElement._gradient[1].value = `${interpolate(
                    80,
                    20,
                    clamp(effectiveDepth)
                )}%`
                updateElement._gradient[2].value = `${interpolate(
                    90,
                    75,
                    clamp(effectiveDepth)
                )}%`
                updateElement.setAttribute(
                    "opacity",
                    interpolate(1, 0, effectiveDepth - 1)
                )
            }
        }
        function color(value) {
            if (value === undefined) return _image === apple1 ? "red" : "green"
            _image = value === "red" ? apple1 : apple2
            element.children[2].setAttribute("href", _image)
        }

        function show(newVisible) {
            visible = newVisible
        }

        function rotate(value) {
            if (value === undefined) return _rotate
            _rotate = value
        }

        function move(nx, ny) {
            x = nx
            y = ny
        }

        function setDepth(nh) {
            depth = nh
        }
    }
})

const apples = new Pool(Apple, 30)
const topApples = new Pool(Apple, 3)

export function getApple() {
    return apples.get()
}

export function getTopApple() {
    return topApples.get()
}

//Put apples in the game
handle("initialize", function({ game, top }) {
    game.push(apples.elements)
    top.push(topApples.elements)
    setTimeout(() => {
        apples.forEach(apple => apple.start())
    }, 50)
})
