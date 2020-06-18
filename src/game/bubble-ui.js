import { plug, useEvent } from "../lib/event-bus"
import {
    Avatar,
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardMedia
} from "@material-ui/core"
import bubble from "../assets/bubble.png"
import React from "react"

export function BubbleItem({ step }) {
    return (
        <Card elevation={4}>
            <CardHeader subheader={` `} />
            <CardMedia
                style={{ paddingTop: 60, backgroundSize: "contain" }}
                image={bubble}
            />
            <CardContent>Pop {step.bubbles} bubbles</CardContent>
        </Card>
    )
}

export function BubbleIndicator({ item, isCurrent, next, update }) {
    useEvent("popped", handlePopped)
    return (
        <Badge
            color="secondary"
            invisible={!isCurrent}
            badgeContent={item.bubbles}
        >
            <Avatar src={bubble} />
        </Badge>
    )

    function handlePopped() {
        if (isCurrent) {
            item.bubbles--
            update(Date.now())
            if (item.bubbles <= 0) {
                next()
            }
        }
    }
}

plug("mission-item", ({ step }) => step && step.bubbles, BubbleItem)

plug(
    "mission-indicator",
    ({ item }) => item.bubbles !== undefined,
    BubbleIndicator
)

