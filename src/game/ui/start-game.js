import React from "react"
import { handle, raise, useEvent } from "../../lib/event-bus"
import { Button } from "@material-ui/core"
import { CenteredBox } from "../../lib/centered"

handle("ui", function (elements) {
    elements.push(<StartScreen key="start" />)
})

function StartScreen() {
    const [playing, setPlaying] = React.useState(false)
    useEvent("startGame", () => setPlaying(true))
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
        raise("startGame")
    }
}
