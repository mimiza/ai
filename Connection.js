import { Neurons, Connections } from "./Context.js"

class Connection {
    constructor(config = {}) {
        this["<"] = config["<"] || config.from // Origin neuron ID from where this connection starts.
        this[">"] = config[">"] || config.to // Destination neuron ID to where this connection ends.
        if (!this.from || !this.to) return undefined
        this["#"] = config["#"] || config.id || `${this.from.id}-${this.to.id}` // Unique ID.
        this.w = config.w || config.weight || Math.random()
        this.c = config.c || config.change || 0
        this.from[">"].push(this.id)
        this.to["<"].push(this.id)
        Connections.set(this.id, this)
    }

    get id() {
        return this["#"]
    }

    get from() {
        return Neurons.get(this["<"])
    }

    set from(value) {
        this["<"] = value
        return Neurons.get(this["<"])
    }

    get to() {
        return Neurons.get(this[">"])
    }

    set to(value) {
        this[">"] = value
        return Neurons.get(this[">"])
    }

    get weight() {
        return this.w
    }

    set weight(value) {
        this.w = value
        return this.w
    }

    get change() {
        return this.c
    }

    set change(value) {
        this.c = value
        return this.c
    }
}

export default Connection
