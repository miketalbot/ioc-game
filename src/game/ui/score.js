import React from "react"
import { Box, makeStyles } from "@material-ui/core"
import { floatText } from "../utilities/floating-text"

const { handle, useEvent } = require("../../lib/event-bus")

let gameScore = 0
handle("startGame", () => (gameScore = 0))
handle("ui", (items) => {
    items.push(<Score key="score" />)
})

const useStyles = makeStyles((theme) => {
    return {
        scoreBox: {
            fontSize: 48,
            textShadow: "0 0 4px black",
            position: "absolute",
            left: theme.spacing(1),
            top: 0,
            color: "white",
            fontFamily: "monospace"
        }
    }
})

function Score() {
    const classes = useStyles()
    const [score, setShownScore] = React.useState(gameScore)
    const [visible, setVisible] = React.useState(false)
    useEvent("score", updateScore)
    useEvent("startGame", () => {
        gameScore = 0
        setShownScore(0)
        setVisible(true)
    })
    useEvent("endGame", () => setVisible(false))
    return (
        !!visible && (
            <Box className={classes.scoreBox}>
                {`${score}`.padStart(6, "0")}
            </Box>
        )
    )
    function updateScore({ score, x, y }) {
        gameScore = gameScore + score
        setShownScore(gameScore)
        let duration = score < 500 ? 2 : 3.5
        let scale = score < 1000 ? 1 : score < 200 ? 2.5 : 4
        floatText(x, Math.max(100, y), `+ ${score}`, "gold", duration, scale)
    }
}
