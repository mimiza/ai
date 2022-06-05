class Connection {
    constructor(config = {}) {
        this["<"] = config["<"] || config.from // Origin neuron from where this connection starts.
        this[">"] = config[">"] || config.to // Destination neuron to where this connection ends.
        this.w = config.w || config.weight || Math.random()
        this.c = config.c || config.change || 0
        if (!this["<"] || !this[">"]) return undefined
        this.from?.outputs.push(this)
        this.to?.inputs.push(this)
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

    get change() {
        return this.c
    }

    set change(value) {
        this.c = value
        return this.c
    }
}

export default Connection
