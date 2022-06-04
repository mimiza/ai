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
        if (layer) return this.layers.push(layer)
    }

    connect() {
        // Connect all the neurons of current layer with the neurons of its last layer.
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            this.layers[index - 1].neurons.forEach(from => layer.neurons.forEach(to => new Connection({ "<": from, ">": to })))
        })
    }

    train(input = [], output = []) {
        this.input(input)
        this.propagate()
        this.backpropagate(output)
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
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            layer.neurons.forEach(neuron => {
                // Multiply weights and outputs, then summarize all together.
                const sum = neuron.inputs.reduce((value, connection) => value + connection.weight * connection.from.output, 0)
                neuron.output = sigmoid(sum + neuron.bias)
            })
        })
        // Return the output layer.
        return this.layers.slice(-1).neurons.map(n => n.output)
    }

    backpropagate(target) {
        this.layers
            .slice()
            .reverse()
            .forEach((layer, i) =>
                layer.neurons.forEach((neuron, j) => {
                    let error = 0
                    if (i === 0) error = target[j] - neuron.output
                    else neuron.outputs.forEach(connection => (error += connection.to.delta * connection.weight))
                    neuron.error = error
                    neuron.delta = error * neuron.output * (1 - neuron.output)
                })
            )
    }

    adjust() {
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            layer.neurons.forEach(neuron => {
                neuron.inputs.forEach(connection => {
                    const change = this.rate * neuron.delta * connection.from.output + this.momentum * connection.change
                    connection.change = change
                    connection.weight += change
                })
                neutron.bias += this.rate * neuron.delta
            })
        })
    }

    backup() {
        // Create JSON data representing the whole network.
    }

    restore(data) {
        // Restore the whole network from given JSON data.
    }
}

export default Network
