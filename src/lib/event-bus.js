import PropTypes from "prop-types"
import React from "react"
import Emitter from "eventemitter2"

const events = new Emitter({
    maxListeners: 0,
    ignoreErrors: true,
    wildcard: true,
    delimiter: "."
})

/**
 * Applies an event handler safely ensuring that the
 * event is removed when the calling component
 * unmounts
 *
 * @param {String} pattern - the event pattern to match
 * @param {Function} handler - the event handler
 */
export function useEvent(pattern, handler) {
    React.useEffect(() => {
        events.on(pattern, handler)
        return function () {
            events.off(pattern, handler)
        }
    })
}

/**
 * Adds an event handler to the event bus
 * and returns a function to
 * remove the handler.
 * Wildcards may be used with '*', '**' and '.' to
 * separate parts of the event name.
 *
 * @param {String} pattern - the event pattern to match
 * @param {Function} handler - the handler function for the event
 * @return {Function} a function to remove the event handler
 */
export function handle(pattern, handler) {
    events.on(pattern, handler)
    return function () {
        events.off(pattern, handler)
    }
}

/**
 * Raises an event on the event bus
 * @param {String} event - the event to raise
 * @param  {...any} params - the parameters for the event
 * @return {[any]} - the parameters passed to the function which
 * is useful so that you can return values without initiailizing them
 * @example
 * const [list] = raise('addToThisList', []) // list will be the list passed to the event
 */
export function raise(event, ...params) {
    events.emit(event, ...params)
    return params
}

/**
 * Raises an asynchronous event on the event-bus
 * you may wait for the Promise
 * @param {String} event - the event to be raised
 * @param  {...any} params - the parameters passed to the event
 * @return {[any]} the parameters passed to the function
 */
export async function raiseAsync(event, ...params) {
    await events.emitAsync(event, ...params)
    return params
}

/**
 * Helper function to allow safe addition of event handlers
 * in a generator function.  The provided generator is given
 * a function to add event handlers to the event bus - the
 * handlers will automatically be removed when the generator
 * exits
 * @param {(Function)} fn - a generator function to call.  It will be passed
 * a function to attach handlers that will be removed when the generator
 * function exits
 */
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

/**
 * Inserts an inversion of control socket that uses the event
 * bus to find "plugs" to render.  The type indicates the
 * type of plug to find, a filter property allows you to filter
 * the resulting list.
 * @component
 * @example
 * <Socket type="yourType" any="other" propsYou={{like: 'here'}}/>
 */
export function Socket({ filter = returnValue, type, children, ...props }) {
    let [items] = raise(
        `ui-plug.${type}`,
        [children && { Component: Children, priority: 100 }],
        props
    )
    items = items.filter(Boolean)
    items.sort((a, b) => (a.priority || 100) - (b.priority || 100))
    raise(`ui-render-plugs.${type}`, items)
    return (
        <>
            {filter(items).map(({ Component }, index) => (
                <Component key={index} {...props} />
            ))}
        </>
    )

    function Children() {
        return children
    }
}
Socket.propTypes = {
    filter: PropTypes.func,
    type: PropTypes.string.isRequired
}

/**
 * Helper function to pass to socket filter, chooses the single highest
 * priority item to render
 * @param {[]} items
 */
export function bestOnly(items) {
    return items[0]
}

/**
 * Helper function to pass to socket filter, selects plugs with a priority
 * lower than a default if there are more than one plugs matching. Used
 * to override defaults - the default will be displayed if there is nothing
 * with a greater priorty
 * @param {Number} value - the priority to display items < than
 */
export function lessThan(value) {
    return function (items) {
        return items.length < 2
            ? items
            : items.filter((i) => i.priority < value)
    }
}

function returnValue(value) {
    return value
}

/**
 * Get the next value
 * @callback PredicateCallback
 * @param {Object} props - The properties passed to the socket
 * @param {[]} list - The currently added items
 * @return {Number|Boolean} return false to not render, otherwise return a priority
 */

/**
 *
 * @param {String} type - the type of the plug
 * @param {PredicateCallback} [predicate] - an optional function to return a priority or "false"
 * if the component should not render give the properties passed
 * @param {Function} Component
 * @param {Number} [priority=100] The priority for the component
 */
export function plug(type, predicate, Component, priority = 100) {
    if (typeof Component === "number") {
        priority = Component
        Component = predicate
        predicate = () => priority
    } else if (Component === undefined) {
        Component = predicate
        predicate = () => priority
    }
    handle(`ui-plug.${type}`, function (list, props) {
        let priority = predicate(props, list)
        if (priority) {
            list.push({ Component, priority })
        }
    })
}

export function ensureArray(item) {
    return Array.isArray(item) ? item : [item].filter(Boolean)
}
