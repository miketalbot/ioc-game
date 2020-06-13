import { using, handle, raise } from "../lib/event-bus"
import { getApple } from "./apple"
import { update } from "js-coroutines"
import { interpolate, clamp, Vector, getVector, ease } from "../lib/math"
import { floatText, cascadeText } from "./floating-text"
import { makeTopmost } from "./topmost"

let usedApples = []

handle("startGame", function() {
    for (let i = 0; i < 20; i++) {
        let apple = getApple()
        apple.setDepth(2)
        apple.color("green")
        apple.move(Math.random() * 800 + 100, Math.random() * 440 + 200)
        apple.show(true)
        const coroutine = update(moveApple(apple))
        usedApples.push({ apple, coroutine })
    }
})

handle("popped", function(bubble) {
    raise("score", { score: 50, x: bubble.x, y: bubble.y })
    floatText(bubble.x, bubble.y, "+ 50", "gold", 2.5, 1.7)
})

function* moveApple(apple) {
    Vector.makeVector(apple)
    let baseX = Math.random() * 0.16 - 0.08
    let v = new Vector()
    const playerRangeSq = (apple.radius * 1.8) ** 2
    let coreDepth = 2
    yield* using(function*(on) {
        on("circle", checkCollision)
        on("player", checkPlayer)
        //Let the apple rotate
        apple.rotate(true)

        let mode = "float"
        while (mode === "float") {
            const t = interpolate(0.02, 0.1, clamp(coreDepth - 0.3))
            v.x = interpolate(v.x, baseX, t)
            v.y = interpolate(v.y, 0, t)
            coreDepth = coreDepth > 0 ? coreDepth - 0.02 : 0
            coreDepth = Math.max(
                0,
                Math.min(2, coreDepth + Math.min(0.035, v.length() / 24))
            )
            apple.setDepth(coreDepth)
            yield
            apple.move(apple.x + v.x, apple.y + v.y)
            if (apple.y < 100) {
                mode = "collect"
            }
            if (apple.x < -50 || apple.x > 1050) {
                mode = "lost"
            }
        }
        apple.rotate(false)
        if (mode === "collect") {
            apple.setDepth(-1)
            let top = makeTopmost(apple)
            let targetX = clamp(apple.x, 80, 920)
            let initialX = apple.x
            let initialY = apple.y

            for (let t = 0; t < 1; t += 0.03) {
                apple.move(
                    interpolate(initialX, targetX, ease(t)),
                    interpolate(initialY, 40, ease(t))
                )
                apple.setDepth(interpolate(0, -1.3, ease(t)))
                apple.update()
                yield
            }
            raise("collect", apple)
            let now = Date.now()
            while (Date.now() - now < 1000) yield
            for (let t = 0; t < 1; t += 0.03) {
                apple.move(apple.x, interpolate(40, -100, ease(t)))
                apple.update()
                yield
            }

            top.return()
        } else {
            raise("lost", apple)
        }

        apple.return()

        function checkPlayer({ x, y, dx, dy, distance }) {
            const toPlayer = getVector(x, y).sub(Vector.from(apple))
            const toPlayerDistanceSq = toPlayer.lengthSq()
            const playerMotion = getVector(dx, dy).scale(1 / 30)
            const angle = Vector.from(apple)
                .sub(getVector(x, y))
                .angleBetween(playerMotion)
            if (
                toPlayerDistanceSq < playerRangeSq &&
                Math.abs(angle) < Math.PI / 4
            ) {
                apple.addRotation((-angle * distance) / 15)
                v.add(playerMotion)
            }
        }

        function checkCollision(other) {
            if (other === apple) return
            const toApple = Vector.from(other).sub(Vector.from(apple).add(v))
            let totalRadius = (apple.radius + other.radius) * 0.8
            let distance = toApple.length()
            if (distance < 1.12 * totalRadius) {
                const scale =
                    interpolate(-1, 0, clamp(distance / totalRadius - 0.6)) / 17
                v.add(toApple.normalize().scale(scale * (other.power || 1)))
            }
        }
    })
}
