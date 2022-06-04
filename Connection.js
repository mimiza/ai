class Connection {
    constructor(config = {}) {
        this["<"] = config["<"] || config.from // Origin neuron from where this connection starts.
        this[">"] = config[">"] || config.to // Destination neuron to where this connection ends.
        this.weight = config.weight || Math.random()
        this.change = config.change || 0
        this.from.outputs.push(connection)
        this.to.inputs.push(connection)
    }

    get from() {
        return this["<"]
    }

    get to() {
        return this[">"]
    }
}

export default Connection
