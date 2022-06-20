import { uid, random } from "./Utils.js"

class Neuron {
    constructor(config = {}) {
        this["#"] = !isNaN(config["#"]) ? Number(config["#"]) : !isNaN(config.id) ? Number(config.id) : uid() // Unique ID. Make sure 0 is also be assigned.
        this["<"] = config["<"] || config.inputs || [] // Incoming connections.
        this[">"] = config[">"] || config.outputs || [] // Outcoming connections.
        this.a = config.a || config.activator // Activator, replace layer/network activator.
        this.b = !isNaN(config.b) ? Number(config.b) : !isNaN(config.bias) ? Number(config.bias) : random(-1, 1) // Bias. Make sure 0 is also be assigned.
        this.o = 0 // Output.
        this.e = config.e || config.error || 0 // Error, used in backpropagation.
        this.d = config.d || config.delta || 0 // Delta, used in backpropagation.
        this.i = config.i || config.iterations || 0 // Iterations, used in NEAT network.
        this.s = config.s || config.state || true // State, used in NEAT network, true for ACTIVE, and false for INACTIVE.
    }

    get id() {
        return this["#"]
    }

    get inputs() {
        return this["<"]
    }

    set inputs(value) {
        this["<"] = value
        return this["<"]
    }

    get outputs() {
        return this[">"]
    }

    set outputs(value) {
        this[">"] = value
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
        return this.state ? this.o : 0 // If neuron is INACTIVE, always return 0.
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

    get iterations() {
        return this.i
    }

    set iterations(value) {
        this.i = value
        return this.i
    }

    get state() {
        return this.s
    }

    set state(value) {
        this.s = value
        return this.s
    }

    sum() {
        const sum = this.inputs.reduce((value, connection) => value + connection.weight * connection.from.output, 0) + this.bias
        this.iterations++
        return this.state ? sum : 0
    }
}

export default Neuron
