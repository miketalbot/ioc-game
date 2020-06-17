import { handle, raise } from "../../lib/event-bus"
import "./level-definitions"
import seedRandom from "seedrandom"
import { configuredLevels } from "./level-definitions"

let currentLevel = 0


handle("startGame", () => {
    raise("setFirstLevel", currentLevel)
    currentLevel = 0
    raise("newLevel")
})


handle("newLevel", (levelNumber = currentLevel + 1) => {
    raise("endLevel")
    Math.random = seedRandom(levelNumber)
    currentLevel = levelNumber
    if (configuredLevels.length >= levelNumber) {
        const levelSpec = { ...configuredLevels[currentLevel - 1], levelNumber }
        raise("levelReady", levelSpec)
    } else {
        let green = ((Math.random() * 8) | 0) + 4
        let red = ((Math.random() * 8) | 0) + (Math.max(3, 10 - green))
        const steps = (3 + Math.random() * 3) | 0
        let levelSpec = {
            levelNumber,
            time: Math.min(99, 60 + (((Math.random() * 30) / 5) | 0) * 5),
            redApples: red,
            greenApples: green,
            mission: [],
            bottleFixed: []
        }

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
        let mission = levelSpec.mission
        let allocate
        let last = -1
        let amount
        for (let i = 0; i < steps; i++) {
            let next = (Math.random() * 3) | 0
            if (next === last) {
                next = (last + 1) % 3
            }
            last = next
            switch (next) {
                case 0:
                    allocate = (Math.random() * 5 + 1) | 0
                    amount = Math.min(red - 1, allocate)
                    if (amount < 1) continue
                    mission.push({ red: amount })
                    red = red - allocate
                    break
                case 1:
                    allocate = (Math.random() * 5 + 1) | 0
                    amount = Math.min(green - 1, allocate)
                    if (amount < 1) continue
                    mission.push({ green: amount })
                    green -= allocate
                    break
                default:
                    mission.push({ bubbles: ((Math.random() * 3) | 0) * 5 + 5 })
                    break
            }
        }
        raise("levelReady", levelSpec)
    }
})


