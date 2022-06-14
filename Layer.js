import Neuron from "./Neuron.js"

class Layer {
    constructor(config = {}) {
        this.n = []
        const neurons = config.n || config.neurons || config
        if (Number.isInteger(neurons)) for (let i = 0; i < neurons; i++) this.neuron()
        if (Array.isArray(neurons)) [...neurons].forEach(neuron => this.neuron(neuron))
        if (config.a || config.activator) this.a = config.a || config.activator
    }

    neuron(config = {}) {
        // Create neuron with or without given config.
        const neuron = new Neuron(config)
        if (neuron) return this.neurons.push(neuron)
    }

    get activator() {
        return this.a
    }

    set activator(value) {
        this.a = value
        return this.a
    }

    get neurons() {
        return this.n
    }
}

export default Layer
