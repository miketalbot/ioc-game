import React from "react"
import { handle } from "../lib/event-bus"
import { Pool } from "../lib/pool"

const TopMost = React.forwardRef(function TopMost(props, ref) {
    return <use href="" ref={addRef} />

    function addRef(element) {
        if (!element) return
        const topMost = {
            element,
            show
        }
        ref(topMost)

        function show(elementOrId) {
            if (
                elementOrId &&
                typeof elementOrId === "object" &&
                elementOrId.element
            ) {
                elementOrId = elementOrId.element.id
            }
            element.setAttribute("href", `#${elementOrId || ""}`)
        }
    }
})

const topItems = new Pool(TopMost, 20)

export function makeTopmost(element) {
    let item = topItems.get()
    if (item) {
        item.show(element)
        return item
    } else {
        return { return: () => {} }
    }
}

handle("initialize", function({ top }) {
    top.push(topItems.elements)
})
