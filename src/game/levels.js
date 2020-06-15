import { handle, raise, useEvent, Socket, raiseAsync } from "../lib/event-bus"
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

const useStyles = makeStyles((theme) => {
    return {
        card: {
            width: "100%"
        },
        time: {
            color: theme.palette.secondary.main
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

handle("startGame", () => raise("newLevel"))
handle("ui", (items) => {
    items.push(<MissionIntro key="intro" />)
    items.push(<Mission key="mission" />)
})

let currentLevel
let levelSpec

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
        time: 30,
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
        bottleCreator: {
            initialDelay: 1000,
            betweenFixed: 35000,
            betweenVariable: 350000
        },
        mission: [{ green: 1 }, { bubbles: 10 }, { red: 1 }]
    },
    {
        time: 60,
        greenApples: 3,
        redApples: 12,
        bottleCreator: {
            initialDelay: 1000,
            betweenFixed: 35000,
            betweenVariable: 350000
        },
        mission: [{ red: 1 }, { green: 1 }, { red: 1 }, { green: 1 }]
    }
]

handle("newLevel", (levelNumber = 1) => {
    raise("endLevel")
    currentLevel = levelNumber
    levelSpec = { ...configuredLevels[currentLevel - 1], levelNumber }
    raise("levelReady", levelSpec)
})

function Mission() {
    const [, setUpdate] = React.useState()
    const [lives, setLives] = React.useState(0)
    const [mission, setMission] = React.useState([])
    const [step, setStep] = React.useState(0)
    useEvent("error", reduceLives)
    useEvent("prepareLevel", prepare)
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
            </Box>
        )
    )
    function reduceLives() {
        setLives(lives - 1)
        if (lives - 1 === 0) {
            raise("gameOver", "lives")
        }
    }
    function update(value) {
        setUpdate(value || Date.now() + Math.random())
    }
    function prepare({ mission = [] }) {
        setStep(0)
        setLives(3)
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
