import React from "react"
import { Box, Typography } from "@material-ui/core"
import { handle, raise } from "../lib/event-bus"
import seedRandom from "seedrandom"
Math.random = seedRandom("Hello")

const configuredLevels = [
    {
        instructions: (
            <Box>
                <Typography gutterBottom>
                    Let's get going with something simple. Just pop the bubbles
                </Typography>
                <Typography gutterBottom>
                    No need to click with a mouse so just use your pointer or
                    your finger to hit the centre of the bubbles.
                </Typography>
            </Box>
        ),
        time: 60,
        greenApples: 5,
        redApples: 5,
        bottleFixed: [
            {
                x: 700,
                y: 500,
                speed: 0.25
            },
            {
                x: 400,
                y: 300,
                speed: 0.5
            },
            {
                x: 1100,
                y: 270,
                speed: 0.3
            }
        ],
        mission: [{ bubbles: 50 }]
    },
    {
        instructions: (
            <Box>
                <Typography gutterBottom>
                    Collect the apples in the right order. You will lose a life
                    if you get them out of sequence.
                </Typography>
                <Typography gutterBottom>
                    Push the apples to the top bank in sequence. There is no
                    need to click with your mouse.
                </Typography>
            </Box>
        ),
        time: 60,
        greenApples: 3,
        redApples: 12,
        bottleCreator: {
            initialDelay: 1000,
            betweenFixed: 35000,
            betweenVariable: 350000
        },
        mission: [{ red: 1 }, { green: 1 }, { red: 1 }, { green: 1 }]
    },
    {
        time: 90,
        greenApples: 2,
        redApples: 2,
        bottleFixed: [
            {
                x: 1010,
                y: 500,
                speed: 0.5
            },
            {
                x: 1400,
                y: 300,
                speed: 0.5
            },
            {
                x: 500,
                y: 600,
                speed: 0.5
            },
            {
                x: 300,
                y: 200,
                speed: 0.25
            }
        ],
        mission: [{ green: 1 }, { bubbles: 70 }, { red: 1 }]
    },
    {
        time: 90,
        greenApples: 15,
        redApples: 3,
        bottleFixed: [
            {
                x: 1010,
                y: 500,
                speed: 0.5
            },
            {
                x: 1400,
                y: 300,
                speed: 0.5
            }
        ],
        mission: [{ green: 3 }, { red: 1 }, { green: 3 }, { red: 1 }]
    }
]

let currentLevel = 0

handle("startGame", () => {
    Math.random = seedRandom("Hello")
    currentLevel = 0
})

handle("newLevel", (levelNumber = currentLevel + 1) => {
    raise("endLevel")
    currentLevel = levelNumber
    if (configuredLevels.length >= levelNumber) {
        const levelSpec = { ...configuredLevels[currentLevel - 1], levelNumber }
        raise("levelReady", levelSpec)
    } else {
        let green = ((Math.random() * 8) | 0) + 4
        let red = (Math.random() * 8) | (0 + (10 - green) + 2)
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
