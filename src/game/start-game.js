import React from "react"
import { handle, raise, useEvent } from "../lib/event-bus"
import { Box, Button } from "@material-ui/core"

handle("ui", function(elements) {
    elements.push(<StartScreen key="start" />)
})

function StartScreen() {
    const [playing, setPlaying] = React.useState(false)
    useEvent("endGame", () => setPlaying(false))
    return (
        !playing && (
            <Box
                position="absolute"
                left="50%"
                top="50%"
                style={{ transform: "translate3d(-50%, -50%, 0)" }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={play}
                >
                    Press To Play
                </Button>
            </Box>
        )
    )

    function play() {
        setPlaying(true)
        raise("startGame")
    }
}
