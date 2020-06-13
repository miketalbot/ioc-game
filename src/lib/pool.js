import React from "react"

export class Pool extends Array {
    constructor(Component, length = 100) {
        super()
        this.Component = Component
        this.attach = this.attach.bind(this)
        this.elements = Array.from({ length }, (props, index) => (
            <Component key={index} ref={this.attach} />
        ))
    }
    attach(item) {
        if (item) {
            item.return = () => {
                if (item.show) item.show(false)
                this.push(item)
            }
            item.return()
        }
    }
    get() {
        if (this.length === 0) return null
        return this.pop()
    }
}
