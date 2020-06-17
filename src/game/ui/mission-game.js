import React from "react"
import {
    handle,
    raise,
    raiseLater,
    Socket,
    useEvent,
    using
} from "../../lib/event-bus"
import { Box, makeStyles, Typography } from "@material-ui/core"
import { update } from "js-coroutines"

const useStyles = makeStyles(() => {
    return {
        timeCounter: {
            textShadow: "0 0 4px #ffffffA0"
        }
    }
})

export function Mission() {
    const [visible, setVisible] = React.useState(false)
    useEvent("prepareLevel", prepare)
    useEvent("endGame", ()=>setVisible(false))
    return (
        <Box
            position="absolute"
            left="0"
            p={1}
            ml={1}
            borderRadius={8}
            bgcolor={"#ffffff40"}
            top="50%"
            style={{
                display: !visible ? "none" : "block",
                transform: "translate3d(0, -50%, 0)"
            }}
        >
            <Box mb={1} color="#00000070">
                <Typography variant="caption">MISSION</Typography>
            </Box>
            <Steps />
            <Time/>
            <Lives/>
        </Box>
    )
    function prepare({mission}) {
        setVisible(!!mission.length)
    }
}

function Steps() {
    const [mission, setMission] = React.useState([])
    useEvent("prepareLevel", prepare)
    const [step, setStep] = React.useState(0)

    return mission.map((item, index) => (
        <Item item={item} index={index} key={index} next={next} step={step}/>
    ))

    function prepare({ mission }) {
        setStep(0)
        setMission(JSON.parse(JSON.stringify(mission)))
    }

    function next() {
        if (step + 1 >= mission.length) {
            raise("endLevel")
            raise("nextLevel")
        }
        setStep(step + 1)
    }


}

function Item({ item, index, step, next }) {
    const [, setUpdate] = React.useState()
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

    function update(value) {
        setUpdate(value || Date.now() + Math.random())
    }
}

function Time() {
    const classes = useStyles()
    let [time, setTime] = React.useState(0)
    useEvent("tick", reduceTime)
    useEvent("prepareLevel", prepare)
    return (
        <Box
            className={classes.timeCounter}
            color={getColorFromTime()}
            fontSize="300%"
        >
            {`${time}`.padStart(2, "0")}
        </Box>
    )

    function prepare({ time }) {
        setTime(time)
        console.log("prepareTime", time)
    }

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
        setTime((time) => time - 1)
        if (time - 1 === 0) {
            raise("endLevel")
            raise("gameOver", "time")
        }
    }
}

function Lives() {
    const [lives, setLives] = React.useState(0)
    useEvent("startGame", prepare)
    useEvent("error", reduceLives)

    return (
        <Box mt={1}>
            {Array.from({ length: lives }).map((_, index) => {
                return (
                    <span
                        key={`currentLife${index}`}
                        style={{ color: "#ff0000D0" }}
                    >
                        ♥
                    </span>
                )
            })}
            {Array.from({ length: 3 - lives }).map((_, index) => {
                return (
                    <span
                        key={`lostLife${index}`}
                        style={{ color: "#00000060" }}
                    >
                        ♥
                    </span>
                )
            })}
        </Box>
    )

    function prepare() {
        setLives(3)
    }

    function reduceLives() {
        setLives(lives - 1)
        if (lives - 1 === 0) {
            raise("gameOver", "lives")
        }
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
    items.push(<Mission key="mission" />)
})
