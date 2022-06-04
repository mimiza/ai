import Neuron from "./Neuron.js"

class Layer {
    constructor(config) {
        this.n = []
        if (Number.isInteger(config)) for (let i = 0; i < config; i++) this.create()
        if (Array.isArray(config)) config.forEach(neuron => this.create(neuron))
    }

    create(config = {}) {
        // Create neuron with or without given config.
        const neuron = new Neuron(config)
        if (neuron) return this.neurons.push(neuron)
    }

    get neurons() {
        return this.n
    }
}

export default Layer
