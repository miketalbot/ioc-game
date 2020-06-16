import {
    handle,
    raise,
    useEvent,
    Socket,
    raiseAsync,
    using
} from "../lib/event-bus"
import React from "react"
import {
    Box,
    Container,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Grid,
    makeStyles,
    CardActions,
    Button
} from "@material-ui/core"
import { CenteredBox } from "../lib/centered"
import { update } from "js-coroutines"
import "./level-definitions"

handle("startGame", () => raise("newLevel"))
handle("ui", (items) => {
    items.push(<MissionIntro key="intro" />)
    items.push(<Mission key="mission" />)
    items.push(<LevelComplete key="complete" />)
    items.push(<GameOver key="gameOver" />)
})

const useStyles = makeStyles((theme) => {
    return {
        card: {
            width: "100%"
        },
        time: {
            color: theme.palette.secondary.main
        },
        timeCounter: {
            textShadow: "0 0 4px #ffffffA0"
        }
    }
})

function MissionIntro() {
    const classes = useStyles()
    const [visible, setVisible] = React.useState(false)
    const [levelSpec, setLevelSpec] = React.useState(null)
    useEvent("levelReady", (level) => {
        setLevelSpec(level)
        setVisible(true)
    })
    return (
        !!levelSpec &&
        visible && (
            <CenteredBox className={classes.card}>
                <Container maxWidth="sm">
                    <Card>
                        <CardHeader
                            subheader="Your mission"
                            title={`Level: ${levelSpec.levelNumber}`}
                        />
                        <CardContent>
                            {!!levelSpec.instructions && levelSpec.instructions}
                            <Grid container spacing={1} justify="center">
                                {levelSpec.mission.map((item, index) => (
                                    <Grid item key={index}>
                                        <Socket
                                            index={index}
                                            type="mission-item"
                                            step={item}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                        <CardActions>
                            {!!levelSpec.time && (
                                <Box ml={1} className={classes.time}>
                                    <Typography variant="button">
                                        You have {levelSpec.time} seconds
                                    </Typography>
                                </Box>
                            )}
                            <Box flexGrow={1} />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={play}
                            >
                                Start
                            </Button>
                        </CardActions>
                    </Card>
                </Container>
            </CenteredBox>
        )
    )
    async function play() {
        await raiseAsync("prepareLevel", levelSpec)
        raise("startLevel", levelSpec)
        setVisible(false)
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
                    raise("tick")
                    time -= 1
                }
            }
        }
    })
})

function Mission() {
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
                    <Item item={item} index={index} key={index} />
                ))}
                <Box mt={1}>
                    {Array.from({ length: lives }).map(() => {
                        return <span style={{ color: "#ff0000D0" }}>♥</span>
                    })}
                    {Array.from({ length: 3 - lives }).map(() => {
                        return <span style={{ color: "#00000060" }}>♥</span>
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

function LevelComplete() {
    const [visible, setVisible] = React.useState(false)
    useEvent("nextLevel", showComplete)
    return (
        visible && (
            <Box
                position="absolute"
                left="50%"
                p={4}
                ml={1}
                borderRadius={8}
                color="#ffffffC0"
                bgcolor={"#ffffff40"}
                top="50%"
                style={{ transform: "translateY(-50%) translateX(-50%)" }}
            >
                <Typography component="div" variant="h3">
                    Level Complete...
                </Typography>
                <Typography component="div" variant="h4">
                    WELL DONE!
                </Typography>
            </Box>
        )
    )
    function showComplete() {
        setVisible(true)
        setTimeout(() => {
            setVisible(false)
            raise("newLevel")
        }, 2000)
    }
}

function GameOver() {
    const [reason, setReason] = React.useState(false)
    useEvent("gameOver", gameOver)
    return (
        !!reason && (
            <Box
                position="absolute"
                left="50%"
                p={4}
                ml={1}
                borderRadius={8}
                color="#fff"
                bgcolor={"#ff4444C0"}
                top="50%"
                style={{ transform: "translateY(-50%) translateX(-50%)" }}
            >
                <Typography component="div" variant="h3">
                    GAME OVER
                </Typography>
                <Typography component="div" variant="h4">
                    {reason === "lives" ? "Out of lives!" : "Time ran out"}
                </Typography>
            </Box>
        )
    )
    function gameOver(reason) {
        setReason(reason)
        setTimeout(() => {
            setReason(false)
            raise("endLevel")
            raise("endGame")
        }, 3000)
    }
}
