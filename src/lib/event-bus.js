import React from "react"
import Emitter from "eventemitter2"

export const events = new Emitter({ maxListeners: 0, ignoreErrors: true })

export function useEvent(pattern, handler) {
    React.useEffect(() => {
        events.on(pattern, handler)
        return function() {
            events.off(pattern, handler)
        }
    })
}

export function handle(pattern, handler) {
    events.on(pattern, handler)
    return function() {
        events.off(pattern, handler)
    }
}

export function raise(event, ...params) {
    events.emit(event, ...params)
    return params
}

export async function raiseAsync(event, ...params) {
    await events.emitAsync(event, ...params)
    return params
}

export function* using(fn) {
    const handlers = []
    try {
        yield* fn(addHandler)
    } finally {
        handlers.forEach(({ event, handler }) => {
            events.off(event, handler)
        })
    }

    function addHandler(event, handler) {
        handlers.push({ event, handler })
        events.on(event, handler)
    }
}
