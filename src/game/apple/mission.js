import React from "react"
import { handle, plug, raise, raiseLater, useEvent } from "../../lib/event-bus"
import {
    Avatar,
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardMedia
} from "@material-ui/core"
import { apple1, apple2 } from "./apple"
import { cascadeText } from "../utilities/floating-text"

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
        raise("bonus", apple)
        raiseLater("score", { score: 1500, x: apple.x, y: apple.y })
    }
}

function RedIndicator({ item, isCurrent, next }) {
    const [red, setRed] = React.useState(item.red)
    useEvent("collect", handleCollect)
    return (
        <Badge color="secondary" invisible={!isCurrent} badgeContent={red}>
            <Avatar src={apple1} />
        </Badge>
    )
    function handleCollect(apple) {
        if (!isCurrent) return
        if (apple.color() === "red") {
            raise("success", apple)
            cascadeText({
                x: apple.x,
                y: apple.y,
                color: "gold",
                number: 12,
                duration: 3.5,
                speed: 300,
                scale: 4
            })
            setRed(red-1)
            if (red === 1) {
                next()
            }
            raiseLater("score", { score: 2500, x: apple.x, y: apple.y })
        } else {
            raise("error", apple)
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
function GreenIndicator({ item, isCurrent, next }) {
    const [green, setGreen] = React.useState(item.green)
    useEvent("collect", handleCollect)
    return (
        <Badge
            color="secondary"
            invisible={!isCurrent}
            badgeContent={green}
        >
            <Avatar src={apple2} />
        </Badge>
    )
    function handleCollect(apple) {
        if (!isCurrent) return
        if (apple.color() === "green") {
            raise("success", apple)
            setGreen(green-1)

            if (green === 1) {
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
            raiseLater("score", { score: 2500, x: apple.x, y: apple.y })
        } else {
            raise("error", apple)
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

function RedItem({ step }) {
    return (
        <Card elevation={4}>
            <CardHeader subheader={` `} />
            <CardMedia
                style={{ paddingTop: 60, backgroundSize: "contain" }}
                image={apple1}
            />
            <CardContent>
                {step.red} red apple{step.red !== 1 ? "s" : ""}
            </CardContent>
        </Card>
    )
}

plug("mission-item", ({ step }) => step && step.green, GreenItem)

function GreenItem({ step }) {
    return (
        <Card elevation={4}>
            <CardHeader subheader={` `} />
            <CardMedia
                style={{ paddingTop: 60, backgroundSize: "contain" }}
                image={apple2}
            />
            <CardContent>
                {step.green} green apple{step.green !== 1 ? "s" : ""}
            </CardContent>
        </Card>
    )
}

handle("getLevelAllocators", function(allocators, levelSpec) {
    allocators.push(allocate("red"))
    allocators.push(allocate("green"))
    function allocate(color) {
        let total = levelSpec[`${color}Apples`]
        return function(step) {
            const amount = (1 + Math.random() * 4) | 0
            if (amount > total) return false
            total -= amount
            step[color] = amount
        }
    }
})

handle("initializeLevel", function(levelSpec) {
    levelSpec.redApples = 3 + ((Math.random() * 10) | 0)
    levelSpec.greenApples = (20 - levelSpec.redApples + Math.random() * 5) | 0
})
