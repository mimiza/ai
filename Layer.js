import { uid } from "./Utils.js"
import { Layers, Neurons } from "./Context.js"
import Neuron from "./Neuron.js"

class Layer {
    constructor(config) {
        this["#"] = config["#"] || config.id || uid() // Unique ID.
        this.n = [] // List of neuron IDs.
        if (Number.isInteger(config)) for (let i = 0; i < config; i++) this.createNeuron()
        if (Array.isArray(config)) config.forEach(neuron => this.createNeuron(neuron))
        Layers.set(this.id, this)
    }

    get id() {
        return this["#"]
    }

    get neurons() {
        // Return an array of neuron objects.
        return this.n.map(neuron => Neurons.get(neuron))
    }

    createNeuron(config = {}) {
        // Create neuron with or without given config.
        const neuron = new Neuron(config)
        if (neuron) return this.n.push(neuron.id)
    }
}

export default Layer
