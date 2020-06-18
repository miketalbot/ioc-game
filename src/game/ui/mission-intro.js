import React from "react"
import { handle, raise, raiseAsync, Socket, useEvent } from "../../lib/event-bus"
import { CenteredBox } from "../../lib/centered"
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Grid,
    makeStyles,
    Typography
} from "@material-ui/core"


const useStyles = makeStyles((theme) => {
    return {
        card: {
            width: "100%"
        },
        time: {
            color: theme.palette.secondary.main
        },
    }
})

export function MissionIntro() {
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
                            <Grid container spacing={2} justify="center">
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
                            <Box flexGrow={1}/>
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

handle("ui", (items) => {
    items.push(<MissionIntro key="intro"/>)
})
