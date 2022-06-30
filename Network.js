import Connection from "./Connection.js"
import Layer from "./Layer.js"
import Neuron from "./Neuron.js"
import { random } from "./Utils.js"

class Network {
    constructor(config = {}) {
        // Try to decode if type of config is "string" instead of "object".
        if (typeof config === "string") return this.decode(config)

        this.initialize(config)

        const layers = config.l || config.layers
        if (layers) this.layer(layers)

        const neurons = config.n || config.neurons
        if (neurons) this.neuron(neurons)

        const connections = config.c || config.connections
        if (connections) this.connect(connections)
    }

    get layers() {
        return this.l
    }

    set layers(value) {
        this.l = value
        return this.l
    }

    get neurons() {
        return this.n
    }

    set neurons(value) {
        this.n = value
        return this.n
    }

    get connections() {
        return this.c
    }

    set connections(value) {
        this.c = value
        return this.c
    }

    get type() {
        return this.t
    }

    set type(value) {
        this.t = value
        return this.t
    }

    get activator() {
        return this.a
    }

    set activator(value) {
        this.a = value
        return this.a
    }

    get rate() {
        return this.r
    }

    set rate(value) {
        this.r = value
        return this.r
    }

    get momentum() {
        return this.m
    }

    set momentum(value) {
        this.m = value
        return this.m
    }

    get iterations() {
        return this.i
    }

    set iterations(value) {
        this.i = value
        return this.i
    }

    get input() {
        return this.layers[0].neurons.map(neuron => neuron.output)
    }

    set input(input = []) {
        this.layers[0].neurons.forEach((neuron, index) => (neuron.output = input[index]))
        return this.input
    }

    get output() {
        return [...this.layers].pop().neurons.map(neuron => neuron.output)
    }

    initialize(config = {}) {
        this.l = [] // Layers.
        this.n = [] // Neurons.
        this.c = [] // Connections.
        this.t = config.t || config.type || "ff" // Network type, "ff" for feedforward, "neat" for NEAT.
        this.a = config.a || config.activator || "sigmoid" // Activator (sigmoid/relu/tanh), used as default activator if no neuron/layer activator exists.
        this.r = config.r || config.rate || 0.01 // Learning rate, used in FF network.
        this.m = config.m || config.momentum || 0.01 // Momentum, used in FF network.
        this.i = config.i || config.iterations || 0 // Iterations, used in FF network.
    }

    layer(config = {}) {
        if (Array.isArray(config) && config.length && config.every(item => !item["#"])) {
            config.forEach(item => this.layer(item))
            return this.connect()
        }
        const layer = new Layer(config)
        if (layer) {
            this.layers.push(layer)
            const neurons = config.n || config.neurons || config
            if (Number.isInteger(neurons)) for (let i = 0; i < neurons; i++) this.neuron({ layer })
        }
        return layer
    }

    neuron(config = {}) {
        if (Array.isArray(config)) return config.forEach(item => this.neuron(item))
        // Create neuron with or without given config.
        if (isNaN(config["#"]) || isNaN(config.id)) config.id = this.neurons.length
        const neuron = new Neuron(config)
        if (neuron) {
            if (config.layer) {
                if (!isNaN(config.layer)) config.layer = this.layers[config.layer]
                config.layer.neurons.push(neuron)
            }
            return this.neurons.push(neuron)
        }
    }

    connect(config = {}) {
        // If the given config is an array of connections.
        if (Array.isArray(config)) return config.forEach(item => this.connect(item))

        // If FROM and TO are string/number, try to get their relative neurons.
        if (!["undefined", "object"].includes(typeof config["<"])) config["<"] = this.neurons[Number(config["<"])]
        if (!["undefined", "object"].includes(typeof config[">"])) config[">"] = this.neurons[Number(config[">"])]
        if (!["undefined", "object"].includes(typeof config.from)) config.from = this.neurons[Number(config.from)]
        if (!["undefined", "object"].includes(typeof config.to)) config.to = this.neurons[Number(config.to)]

        const from = config["<"] || config.from || {}
        const to = config[">"] || config.to || {}

        // If FROM and TO are neurons.
        if (from.outputs && to.inputs) {
            const connection = new Connection(config)
            return this.connections.push(connection) // This needs to be fixed. Must include innovations ID?
        }

        // If FROM and TO are layers.
        if (from.neurons && to.neurons) return from.neurons.forEach(_from => to.neurons.forEach(_to => this.connect({ from: _from, to: _to })))

        // If FROM and TO are not provided, connect each layer's neurons with its surrouding layers' neurons.
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            this.connect({ from: this.layers[index - 1], to: layer })
        })
    }

    train(input = [], output = []) {
        this.input = input
        this.propagate()
        this.backpropagate(output)
        this.iterations++
    }

    calculate(input = []) {
        this.input = input
        return this.propagate()
    }

    activate(input, activator) {
        return this[activator || this.activator](input)
    }

    propagate() {
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            layer.neurons.forEach(neuron => {
                // Multiply weights and outputs, then summarize all together.
                const activator = neuron.activator || layer.activator || this.activator
                neuron.output = this.activate(neuron.input, activator)
            })
        })
        // Return the output layer.
        return this.output
    }

    backpropagate(target) {
        return [...this.layers].reverse().forEach((layer, i) =>
            layer.neurons.forEach((neuron, j) => {
                let error = 0
                if (i === 0) error = 2 * (neuron.output - target[j])
                else neuron.outputs.forEach(connection => (error += connection.to.delta * connection.weight))
                neuron.error = error
                const activator = neuron.activator || layer.activator || this.activator
                switch (activator) {
                    case "sigmoid":
                        neuron.delta = error * neuron.output * (1 - neuron.output)
                        break
                    case "relu":
                        neuron.delta = error * (neuron.output > 0 ? 1 : neuron.output < 0 ? 0 : undefined) || error
                        break
                    case "tanh":
                        neuron.delta = error * (1 - Math.pow(Math.tanh(neuron.output), 2))
                        break
                }
                neuron.inputs.forEach(connection => {
                    const change = this.rate * neuron.delta * connection.from.output + this.momentum * connection.change
                    connection.change = change
                    connection.weight -= change
                })
                neuron.bias -= this.rate * neuron.delta
            })
        )
    }

    mutate() {
        const activators = ["sigmoid", "relu", "tanh"]

        // Add new random neuron.
        if (Math.random() <= 0.05) this.neuron({ layer: 1, activator: random(activators) })

        this.neurons.forEach(neuron => {
            // Change random neuron biases.
            if (Math.random() <= 0.05) neuron.bias += neuron.bias * 0.01 * random([-1, 1])
            // Disable random neuron.
            if (Math.random() <= 0.01) neuron.state = random([true, false])
        })

        this.connections.forEach(connection => {
            // Change random connection weight.
            if (Math.random() <= 0.1) connection.weight += connection.weight * 0.01 * random([-1, 1])
            // Disable random connections.
            if (Math.random() <= 0.01) connection.state = random([true, false])
        })

        // Add new random connection.
        if (Math.random() <= 0.1) {
            const from = random(this.neurons)
            const to = random(this.neurons)
            if (!this.connections.filter(c => c.from.id === from.id && c.to.id === to.id).length) this.connect({ from, to })
        }

        // Add new random node between a connection.
        if (Math.random() <= 0.01 && this.connections.length) {
            const connection = random(this.connections.filter(connection => connection.state))
            const neuron = this.neuron({ layer: 1, activator: random(activators) })
            connection.state = false
            this.connect({ from: connection.from, to: neuron.id })
            this.connect({ from: neuron.id, to: connection.to })
        }
    }

    sigmoid(x = 0) {
        return 1 / (1 + Math.exp(-x))
    }

    relu(x = 0) {
        return Math.max(0, x)
    }

    tanh(x = 0) {
        return Math.tanh(x)
    }

    encode(data = this) {
        if (Array.isArray(data)) return data.map(d => this.encode(d))
        if (typeof data === "object") {
            // Reduce data, remove undefined properties.
            for (const key in data) if (data[key] === undefined) delete data[key]
            // If this is a layer, transform its array of neurons.
            if (Object.keys(data).length <= 2 && Array.isArray(data.n)) data.n = data.n.map(neuron => neuron.id)
            // If this is a layer without configs, just return its array of neurons.
            if (Object.keys(data).length === 1 && data.n) return data.n
            const result = {}
            for (const key in data) {
                // Skip undefined data and empty array.
                if (data[key] === undefined || (Array.isArray(data[key]) && !data[key].length)) continue
                // If this is a neuron, ignore connection properties.
                if (data.inputs && data.outputs && (key === ">" || key === "<")) continue
                // If this is a connection, only return ids of "from" and "to" instead of full object.
                if (data.from && data.to && ["<", ">"].includes(key)) result[key] = data[key].id
                else result[key] = this.encode(data[key])
            }
            return result
        }
        return data
    }

    decode(data = {}) {
        // Decode the whole network from given JSON data.
        if (typeof data === "string") {
            try {
                data = JSON.parse(data)
                if (typeof data !== "object") return
            } catch {}
        }
        // Reset network layers, neurons, connections.
        this.initialize()
        // Restore none object properties.
        for (const key in data) if (typeof data[key] !== "object") this[key] = data[key]
        // Restore network neurons.
        data.n.forEach(item => this.neuron(item))
        // Restore network layers.
        data.l.forEach(item => {
            if (Array.isArray(item)) item = { n: item }
            item.n = item.n.map(neuron => this.neurons[neuron])
            this.layer(item)
        })
        // Restore network connections.
        data.c.forEach(item => this.connect(item))
        return this
    }
}

export default Network
