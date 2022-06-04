import { uid, random } from "./Utils.js"

class Neuron {
    constructor(config = {}) {
        this["#"] = config["#"] || config.id || uid() // Unique ID.
        this["<"] = config["<"] || config.inputs || [] // Incoming connections.
        this[">"] = config[">"] || config.outputs || [] // Outcoming connections.
        this.b = config.b || config.bias || random(-5, 5)
        this.o = 0
        this.e = config.e || config.error || 0
        this.d = config.d || config.delta || 0
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

    get bias() {
        return this.b
    }

    set bias(value) {
        this.b = value
        return this.b
    }

    get output() {
        return this.o
    }

    set output(value) {
        this.o = value
        return this.o
    }

    get error() {
        return this.e
    }

    set error(value) {
        this.e = value
        return this.e
    }

    get delta() {
        return this.d
    }

    set delta(value) {
        this.d = value
        return this.d
    }
}

export default Neuron
