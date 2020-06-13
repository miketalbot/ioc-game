const vectors = Array.from({ length: 512 }, () => new Vector())

let index = 0
export function getVector(x, y) {
    let vector = vectors[index++ % vectors.length]
    vector.x = x
    vector.y = y
    return vector
}

export function clamp(v, min = 0, max = 1) {
    return Math.max(min, Math.min(max, v))
}

export function interpolate(from, to, time) {
    return (to - from) * time + from
}

export function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2
}

export function ease(t) {
    return (Math.sin(t * Math.PI - Math.PI / 2) + 1) / 2
}

export function Vector(x = 0, y = 0) {
    this.x = x
    this.y = y
}
Vector.prototype.dot = function(other) {
    return dot(this.x, this.y, other.x, other.y)
}
Vector.prototype.lengthSq = function() {
    return this.x ** 2 + this.y ** 2
}
Vector.prototype.length = function() {
    return Math.sqrt(this.lengthSq())
}
Vector.prototype.normalize = function() {
    const length = this.length()
    this.x = this.x / length
    this.y = this.y / length
    return this
}
Vector.prototype.add = function(other) {
    this.x += other.x
    this.y += other.y
    return this
}
Vector.prototype.perp = function() {
    this.y = -this.y
    return this
}
Vector.prototype.sub = function(other) {
    this.x -= other.x
    this.y -= other.y
    return this
}
Vector.prototype.scale = function(factor) {
    this.x *= factor
    this.y *= factor
    return this
}
Vector.prototype.angleBetween = function(other) {
    let v1 = this
    let v2 = other
    let dot = v1.x * v2.x + v1.y * v2.y
    let perp = v1.x * v2.y - v1.y * v2.x
    return Math.atan2(perp, dot)
}
Vector.prototype.copy = function() {
    return Vector.from(this)
}
Vector.makeVector = function(obj) {
    if (obj.x !== undefined && obj.y !== undefined) {
        Object.setPrototypeOf(obj, Vector.prototype)
    }
    return obj
}
Vector.from = function(obj) {
    if (obj.x !== undefined && obj.y !== undefined) {
        return getVector(obj.x, obj.y)
    }
    return null
}
