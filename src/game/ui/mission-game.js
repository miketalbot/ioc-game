import React from "react"
import { handle, raise, raiseLater, Socket, useEvent, using } from "../../lib/event-bus"
import { Box, makeStyles, Typography } from "@material-ui/core"
import { update } from "js-coroutines"

const useStyles = makeStyles((theme) => {
    return {
        timeCounter: {
            textShadow: "0 0 4px #ffffffA0"
        }
    }
})

export function Mission() {
    const classes = useStyles()
    const [, setUpdate] = React.useState()
    const [time, setTime] = React.useState(0)
    const [lives, setLives] = React.useState(0)
    const [mission, setMission] = React.useState([])
    const [step, setStep] = React.useState(0)
    useEvent("error", reduceLives)
    useEvent("endLevel", () => setMission([]))
    useEvent("prepareLevel", prepare)
    useEvent("tick", reduceTime)
    return (
        !!mission.length && (
            <Box
                position="absolute"
                left="0"
                p={1}
                ml={1}
                borderRadius={8}
                bgcolor={"#ffffff40"}
                top="50%"
                style={{ transform: "translateY(-50%)" }}
            >
                <Box mb={1} color="#00000070">
                    <Typography variant="caption">MISSION</Typography>
                </Box>
                {mission.map((item, index) => (
                    <Item item={item} index={index} key={index}/>
                ))}
                <Box mt={1}>
                    {Array.from({ length: lives }).map((_, index) => {
                        return <span key={`currentLife${index}`} style={{ color: "#ff0000D0" }}>♥</span>
                    })}
                    {Array.from({ length: 3 - lives }).map((_, index) => {
                        return <span key={`lostLife${index}`} style={{ color: "#00000060" }}>♥</span>
                    })}
                </Box>
                <Box
                    className={classes.timeCounter}
                    color={getColorFromTime()}
                    fontSize="300%"
                >
                    {`${time}`.padStart(2, "0")}
                </Box>
            </Box>
        )
    )

    function getColorFromTime() {
        if (time > 10) {
            return "#FFFFFF80"
        } else if (time > 5) {
            return "#FF7F50"
        } else {
            return "#D43D1A"
        }
    }

    function reduceTime() {
        setTime(time - 1)
        if (time - 1 === 0) {
            raise("endLevel")
            raise("gameOver", "time")
        }
    }

    function reduceLives() {
        setLives(lives - 1)
        if (lives - 1 === 0) {
            raise("gameOver", "lives")
        }
    }

    function update(value) {
        setUpdate(value || Date.now() + Math.random())
    }

    function prepare({ time, mission = [] }) {
        setStep(0)
        setLives(3)
        setTime(time)
        setMission(JSON.parse(JSON.stringify(mission)))
    }

    function next() {
        if (step + 1 >= mission.length) {
            raise("endLevel")
            raise("nextLevel")
        }
        setStep(step + 1)
    }

    function Item({ item, index }) {
        return (
            <Box
                mt={0.5}
                style={{
                    filter: step > index ? "grayscale(1)" : "",
                    opacity: index === step ? 1 : 0.5
                }}
            >
                <Socket
                    next={next}
                    update={update}
                    type="mission-indicator"
                    item={item}
                    isCurrent={index === step}
                />
            </Box>
        )
    }
}

update(function* () {
    yield* using(function* (on) {
        let playing = false
        let time = 0
        on("startLevel", () => {
            time = 0
            playing = true
        })
        on("endLevel", () => {
            playing = false
        })
        while (true) {
            yield
            if (playing) {
                time = time + 1 / 60
                if (time >= 1) {
                    raiseLater("tick")
                    time -= 1
                }
            }
        }
    })
}).catch(console.error)

handle("ui", (items) => {
    items.push(<Mission key="mission"/>)
})
