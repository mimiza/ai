import Connection from "./Connection.js"
import Layer from "./Layer.js"
import { sigmoid } from "./Utils.js"

class Network {
    constructor(config = {}) {
        this.layers = []
        this.rate = config.rate || 0.1
        this.momentum = config.momentum || 0.1
        this.iterations = config.iterations || 0
    }

    createLayer(config = {}) {
        const layer = new Layer(config)
        if (layer) this.layers.push(layer)
    }

    connect() {
        // Connect all the neurons of current layer with the neurons of its last layer.
        this.layers.forEach((current, index) => {
            if (index === 0) return
            this.layers[index - 1].neurons.forEach(from => current.neurons.forEach(to => new Connection({ "<": from, ">": to })))
        })
    }

    train(input = [], output) {
        this.input(input)
        this.propagate()
        this.backPropagate(output)
        this.adjust()
        this.iterations + 1
    }

    calculate(input = []) {
        this.input(input)
        return this.propagate()
    }

    input(inputs = []) {
        this.layers[0].forEach((neuron, index) => (neuron.output = inputs[index]))
    }

    propagate() {
        for (let layer = 1; layer < this.layers.length; layer++) {
            for (let neuron = 0; neuron < this.layers[layer].neurons.length; neuron++) {
                const current = this.layers[layer].neurons[neuron]
                const bias = current.bias
                const sum = current.inputs.reduce((value, connection) => value + connection.weight * connection.from.output, 0)
                current.output = sigmoid(bias + sum)
            }
        }
        return this.layers.slice(-1).neurons.map(n => n.output)
    }

    backPropagate(target) {
        for (let layer = this.layers.length - 1; layer >= 0; layer--) {
            const currentLayer = this.layers[layer]

            for (let neuron = 0; neuron < currentLayer.neurons.length; neuron++) {
                const currentNeuron = currentLayer.neurons[neuron]
                let output = currentNeuron.output

                let error = 0
                if (layer === this.layers.length - 1) error = target[neuron] - output
                else {
                    for (let k = 0; k < currentNeuron.outputConnections.length; k++) {
                        const currentConnection = currentNeuron.outputConnections[k]
                        error += currentConnection.to.delta * currentConnection.weight
                    }
                }
                currentNeuron.setError(error)
                currentNeuron.setDelta(error * output * (1 - output))
            }
        }
    }

    adjust() {
        for (let layer = 1; layer <= this.layers.length - 1; layer++) {
            const prevLayer = this.layers[layer - 1]
            const currentLayer = this.layers[layer]

            for (let neuron = 0; neuron < currentLayer.neurons.length; neuron++) {
                const currentNeuron = currentLayer.neurons[neuron]
                let delta = currentNeuron.delta

                for (let i = 0; i < currentNeuron.inputConnections.length; i++) {
                    const currentConnection = currentNeuron.inputConnections[i]
                    let change = currentConnection.change

                    change = this.learningRate * delta * currentConnection.from.output + this.momentum * change

                    currentConnection.setChange(change)
                    currentConnection.setWeight(currentConnection.weight + change)
                }

                currentNeuron.setBias(currentNeuron.bias + this.learningRate * delta)
            }
        }
    }

    backup() {
        // Create JSON data representing the whole network.
    }

    restore() {
        // Restore the whole network from given JSON data.
    }
}

export default Network
