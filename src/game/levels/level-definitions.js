import React from "react"
import { Box, Typography } from "@material-ui/core"
import { handle } from "../../lib/event-bus"

const configuredLevels = [
    {
        instructions: (
            <Box>
                <Typography gutterBottom>
                    Let's get going with something simple. Just pop the bubbles
                </Typography>
                <Typography variant={"body2"} gutterBottom>
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
                <Typography gutterBottom variant={"body2"}>
                    Collect the apples in the right order. You will lose a life
                    if you get them out of sequence.
                </Typography>
                <Typography gutterBottom>
                    Push the apples to the top bank in sequence. There is no
                    need to click with your mouse.
                </Typography>
                <Typography gutterBottom>
                    <strong>
                        <em>
                            The harder you push an apple the more it sinks.
                            Underwater apples are hard to move!
                        </em>
                    </strong>
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

handle('get-levels', function (levels) {
    levels.push(...configuredLevels)
})
