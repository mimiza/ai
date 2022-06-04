import { uid } from "./Utils.js"

class Neuron {
    constructor(config = {}) {
        this["#"] = config["#"] || uid() // Unique ID.
        this["<"] = [] // Incoming connections.
        this[">"] = [] // Outcoming connections.
        this.bias = config.b || this.getBias()
        this.output = 0
    }

    get id() {
        return this["#"]
    }

    get inputs() {
        return this["<"]
    }

    get outputs() {
        return this[">"]
    }

    getBias(min, max) {
        min = min || -5
        max = max || 5
        return Math.floor(Math.random() * (max - min)) - Math.abs(min)
    }
}

export default Neuron
