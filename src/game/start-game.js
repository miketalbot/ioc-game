import React from "react"
import { handle, raise, useEvent } from "../lib/event-bus"
import { Box, Button } from "@material-ui/core"
import { CenteredBox } from "../lib/centered"

handle("ui", function (elements) {
    elements.push(<StartScreen key="start" />)
})

function StartScreen() {
    const [playing, setPlaying] = React.useState(false)
    useEvent("endGame", () => setPlaying(false))
    return (
        !playing && (
            <CenteredBox>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={play}
                >
                    Press To Play
                </Button>
            </CenteredBox>
        )
    )

    function play() {
        setPlaying(true)
        raise("startGame")
    }
}
