class Neuron {
    constructor(config = {}) {
        this.id = config.id || this.uid()
        this.ins = []
        this.outs = []
        this.bias = config.bias || this.getBias()
    }

    getBias() {
        const min = -5
        const max = 5
        return Math.floor(Math.random() * (max - min) - max)
    }

    uid() {
        return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x))
    }

    ReLU(x) {
        return Math.max(0, x)
    }
}

export default Neuron
