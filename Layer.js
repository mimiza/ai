import Neuron from "./Neuron.js"

class Layer {
    constructor(config = {}) {
        this.neurons = []
        if (config.count) for (const i = 0; i < config.count; i++) this.createNeuron()
        if (config.neurons) config.neurons.forEach(neuron => this.createNeuron(neuron))
    }

    createNeuron(config = {}) {
        const neuron = new Neuron(config)
        this.neurons.push(neuron)
    }
}

export default Layer
