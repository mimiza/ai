import { uid, random } from "./Utils.js"
import { Neurons, Connections } from "./Context.js"

class Neuron {
    constructor(config = {}) {
        this["#"] = config["#"] || config.id || uid() // Unique ID.
        this["<"] = config["<"] || config.inputs || [] // List of incoming connection IDs.
        this[">"] = config[">"] || config.outputs || [] // List of outcoming connection IDs.
        this.b = config.b || config.bias || random(-1, 1) // Bias.
        this.e = config.e || config.error || 0 // Error.
        this.d = config.d || config.delta || 0 // Delta.
        this.o = 0 // Output.
        Neurons.set(this.id, this)
    }

    get id() {
        return this["#"]
    }

    get inputs() {
        return this["<"].map(connection => Connections.get(connection))
    }

    get outputs() {
        return this[">"].map(connection => Connections.get(connection))
    }

    get bias() {
        return this.b
    }

    set bias(value) {
        this.b = value
        return this.b
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

    get output() {
        return this.o
    }

    set output(value) {
        this.o = value
        return this.o
    }
}

export default Neuron
