import React from "react"
import { handle, useEvent } from "./lib/event-bus"
import { makeStyles } from "@material-ui/core/styles"
import { Box } from "@material-ui/core"

handle("ui", function (items) {
    items.push(<PoweredBy key={"power"} />)
})

const useStyles = makeStyles(() => {
    return {
        logo: {
            position: "absolute",
            bottom: 20,
            color: "white !important",
            textTransform: "uppercase",
            fontSize: "150%",
            width: "100%"
        }
    }
})

function PoweredBy() {
    const classes = useStyles()
    const [visible, setVisible] = React.useState(true)
    useEvent("startGame", () => setVisible(false))
    useEvent("endGame", () => setVisible(true))
    return (
        !!visible && (
            <Box class={classes.logo}>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={"http://js-coroutines.com"}
                >
                    Powered by js-coroutines
                </a>
            </Box>
        )
    )
}
