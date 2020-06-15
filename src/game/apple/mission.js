import React from "react"
import { plug, useEvent, raise } from "../../lib/event-bus"
import {
    Card,
    CardHeader,
    CardMedia,
    Avatar,
    Badge,
    CardContent
} from "@material-ui/core"
import { apple1, apple2 } from "./apple"
import { cascadeText, floatText } from "../floating-text"

plug("mission-indicator", ({ item }) => item.red !== undefined, RedIndicator)
plug(
    "mission-indicator",
    ({ item }) => item.green !== undefined,
    GreenIndicator
)
plug(
    "mission-indicator",
    ({ item }) => !item.red && !item.green,
    BonusIndicator
)

function BonusIndicator({ isCurrent }) {
    useEvent("collect", handleCollect)
    return null
    function handleCollect(apple) {
        if (!isCurrent) return
        cascadeText({
            x: apple.x,
            y: apple.y,
            color: "gold",
            number: 12,
            duration: 3.5,
            speed: 300,
            scale: 4
        })
        raise("score", { score: 1500, x: apple.x, y: apple.y })
        floatText(apple.x, apple.y, "+ 1500", "gold", 3.5, 2)
    }
}

function RedIndicator({ item, isCurrent, next, update }) {
    useEvent("collect", handleCollect)
    return (
        <Badge color="secondary" invisible={!isCurrent} badgeContent={item.red}>
            <Avatar src={apple1} />
        </Badge>
    )
    function handleCollect(apple) {
        if (!isCurrent) return
        if (apple.color() === "red") {
            cascadeText({
                x: apple.x,
                y: apple.y,
                color: "gold",
                number: 12,
                duration: 3.5,
                speed: 300,
                scale: 4
            })
            item.red--
            update()
            if (!item.red) {
                next()
            }
            raise("score", { score: 2500, x: apple.x, y: apple.y })
            floatText(apple.x, apple.y, "+ 2500", "gold", 3.5, 2)
        } else {
            raise("error")
            cascadeText({
                x: apple.x,
                y: apple.y,
                color: "red",
                text: "❌",
                number: 6,
                duration: 3.5,
                speed: 300,
                scale: 3
            })
        }
    }
}
function GreenIndicator({ item, isCurrent, next, update }) {
    useEvent("collect", handleCollect)
    return (
        <Badge
            color="secondary"
            invisible={!isCurrent}
            badgeContent={item.green}
        >
            <Avatar src={apple2} />
        </Badge>
    )
    function handleCollect(apple) {
        if (!isCurrent) return
        if (apple.color() === "green") {
            item.green--
            update()
            if (!item.green) {
                next()
            }

            cascadeText({
                x: apple.x,
                y: apple.y,
                color: "gold",
                number: 12,
                duration: 3.5,
                speed: 300,
                scale: 4
            })
            raise("score", { score: 2500, x: apple.x, y: apple.y })
            floatText(apple.x, apple.y, "+ 2500", "gold", 3.5, 2)
        } else {
            raise("error")
            cascadeText({
                x: apple.x,
                y: apple.y,
                color: "red",
                text: "❌",
                number: 12,
                duration: 3.5,
                speed: 300,
                scale: 5
            })
        }
    }
}

plug("mission-item", ({ step }) => step && step.red, RedItem)

function RedItem({ step, index }) {
    return (
        <Card variant="outlined">
            <CardHeader subheader={` `} />
            <CardMedia
                style={{ paddingTop: 80, backgroundSize: "contain" }}
                image={apple1}
            />
            <CardContent>
                Collect {step.red} red apple{step.red !== 1 ? "s" : ""}
            </CardContent>
        </Card>
    )
}

plug("mission-item", ({ step }) => step && step.green, GreenItem)

function GreenItem({ step, index }) {
    return (
        <Card variant="outlined">
            <CardHeader subheader={` `} />
            <CardMedia
                style={{ paddingTop: 80, backgroundSize: "contain" }}
                image={apple2}
            />
            <CardContent>
                Collect {step.green} green apple{step.green !== 1 ? "s" : ""}
            </CardContent>
        </Card>
    )
}
