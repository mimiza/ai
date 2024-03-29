class Connection {
    constructor(config = {}) {
        this["<"] = config["<"] || config.from // Origin neuron from where this connection starts.
        this[">"] = config[">"] || config.to // Destination neuron to where this connection ends.
        this["#"] = config["#"] || this.from.id + "-" + this.to.id // Unique ID. Make sure 0 is also be assigned.
        this.w = config.w || config.weight || Math.random()
        this.t = config.t || config.timestep || 1 // Timestep, used in Recurrent Neural Network.
        this.c = config.c || config.change || 0
        this.s = config.s || config.state || true // State, used in NEAT network, true for ACTIVE, and false for INACTIVE.
        if (!this["<"] || !this[">"]) return undefined
        this["<"]?.[">"].push(this)
        this[">"]?.["<"].push(this)
    }

    get id() {
        return this["#"]
    }

    get from() {
        return this["<"]
    }

    set from(value) {
        this["<"] = value
        return this["<"]
    }

    get to() {
        return this[">"]
    }

    set to(value) {
        this[">"] = value
        return this[">"]
    }

    get weight() {
        return this.w
    }

    set weight(value) {
        this.w = value
        return this.w
    }

    get timestep() {
        return this.t
    }

    set timestep(value) {
        this.t = value
        return this.t
    }

    get change() {
        return this.c
    }

    set change(value) {
        this.c = value
        return this.c
    }

    get state() {
        if (!this.from.state || !this.to.state) return false
        return this.s
    }

    set state(value) {
        this.s = value
        return this.s
    }
}

export default Connection
