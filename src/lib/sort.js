function sortByExtraction(fn) {
    return function(a, b) {
        const va = fn(a)
        const vb = fn(b)
        return vb > va ? -1 : va === vb ? 0 : 1
    }
}

export const inPriorityOrder = sortByExtraction((v) => v.priority || 0)
