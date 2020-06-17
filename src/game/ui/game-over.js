import React from "react"
import { handle, raise, useEvent } from "../../lib/event-bus"
import { Box, Typography } from "@material-ui/core"

export function GameOver() {
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

handle("ui", (items) => {
    items.push(<GameOver key="gameOver"/>)
})
