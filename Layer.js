import Neuron from "./Neuron.js"

class Layer {
    constructor(config) {
        this.a = config?.a || config?.activator || "sigmoid"
        this.n = []
        if (Number.isInteger(config?.n || config?.neurons || config)) for (let i = 0; i < (config?.n || config?.neurons || config); i++) this.create()
        if (Array.isArray(config?.n || config?.neurons || config)) [...(config?.n || config?.neurons || config)].forEach(neuron => this.create(neuron))
    }

    create(config = {}) {
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
