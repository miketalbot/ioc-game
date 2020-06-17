import React from "react"
import { handle, raise, useEvent } from "../../lib/event-bus"
import { Box, Typography } from "@material-ui/core"

export function LevelComplete() {
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

handle("ui", (items) => {
    items.push(<LevelComplete key="complete"/>)
})
