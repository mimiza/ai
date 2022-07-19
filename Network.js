import Connection from "./Connection.js"
import Layer from "./Layer.js"
import Neuron from "./Neuron.js"
import { random } from "./Utils.js"

class Network {
    constructor(config = {}) {
        // Try to decode if type of config is encoded.
        if (this.encoded(config)) return this.decode(config)

        this.initialize(config)

        const neurons = config.n || config.neurons
        if (neurons) this.neuron(neurons)

        const layers = config.l || config.layers
        if (layers) this.layer(layers)

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
        return this.layers[0].n.map(neuron => neuron.input)
    }

    set input(input = []) {
        this.layers[0].n.forEach((neuron, index) => (neuron.input = input[index]))
        return this.input
    }

    get output() {
        return [...this.layers].pop().n.map(neuron => neuron.output)
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
            this.l.push(layer) // Add new layer to array of layers.
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
                config.layer.n.push(neuron)
            }
            this.n.push(neuron)
            return neuron
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
        if (from.outputs && to.inputs && !this.connections.some(c => c.from.id === from.id && c.to.id === to.id)) {
            const connection = new Connection(config)
            return this.c.push(connection)
        }

        // If FROM and TO are layers.
        if (from.neurons?.length && to.neurons?.length) return from.neurons.forEach(_from => to.neurons.forEach(_to => this.connect({ from: _from, to: _to })))

        // If FROM and TO are not provided, connect each layer's neurons with its surrouding layers' neurons.
        let i
        this.layers.forEach((layer, index) => {
            if (!layer.neurons?.length) return
            if (this.layers[i]?.neurons?.length && layer?.neurons?.length && index > i) this.connect({ from: this.layers[i], to: layer })
            if (layer.neurons?.length) i = index
        })
    }

    train(input = [], output = []) {
        this.calculate(input)
        this.backpropagate(output)
        this.iterations++
    }

    clear() {
        this.neurons.forEach(neuron => {
            neuron.input = 0
            neuron.output = undefined
        })
    }

    calculate(input = [], debug = false) {
        this.clear()
        this.input = input
        return this.propagate(debug)
    }

    activate(input, activator) {
        return this[activator || this.activator](input)
    }

    propagate(debug = false) {
        const history = []
        let loop = true
        // Loop until all neurons and their input neurons are activated.
        while (loop === true) {
            loop = false
            this.layers.forEach((layer, index) =>
                layer.neurons.forEach(neuron => {
                    const activator = neuron.activator || layer.activator || this.activator
                    if (index === 0 && !neuron.inputs.length) neuron.output = neuron.input
                    // Multiply weights and outputs, summarize all inputs, then activate.
                    else neuron.output = this.activate(neuron.input + neuron.bias, activator)
                    if (neuron.inputs.some(connection => connection.from.output === undefined)) loop = true
                    if (debug) history.push({ id: neuron.id, activator, state: neuron.state, inputs: neuron.inputs.map(connection => Object.assign({}, { id: connection.from.id, output: connection.from.output, weight: connection.weight })), input: neuron.input, bias: neuron.bias, output: neuron.output })
                })
            )
        }
        if (debug) console.log(history)
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
                        neuron.delta = error * (neuron.output >= 0 ? 1 : 0)
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

        // Add new random layer.
        if (Math.random() < 0.001 && !this.layers.filter(l => !l.n.length).length) this.l.splice(random(1, this.layers.length - 2), 0, new Layer())

        // Add new random neuron.
        if (Math.random() < 0.001) this.neuron({ layer: random(1, this.layers.length - 2), activator: random(activators) })

        // Add new random connection.
        if (Math.random() < 0.1) {
            const from = random(this.neurons)
            const to = random(this.neurons)
            if (!this.connections.some(c => c.from.id === from.id && c.to.id === to.id)) this.connect({ from, to })
        }

        // Add new random node between a connection.
        if (Math.random() < 0.01 && this.connections.length) {
            const connection = random(this.connections.filter(connection => connection.state))
            const neuron = this.neuron({ layer: random(1, this.layers.length - 2), activator: random(activators) })
            connection.state = false
            this.connect({ from: connection.from, to: neuron.id })
            this.connect({ from: neuron.id, to: connection.to })
        }

        this.neurons.forEach(neuron => {
            // Change random neuron biases.
            if (Math.random() < 0.1) neuron.bias += neuron.bias * random(0.01, 0.2) * random([-1, 1])
            // Enable/disable random neuron.
            if (Math.random() < 0.001 && ![...this.layers[0].n, ...this.layers[this.layers.length - 1].n].some(n => n.id === neuron.id)) neuron.state = random([true, false])
        })

        this.connections.forEach(connection => {
            // Change random connection weight.
            if (Math.random() < 0.8) connection.weight += connection.weight * random(0.01, 0.5) * random([-1, 1])
            // Enable/disable random connections.
            if (Math.random() < 0.001) connection.state = random([true, false])
        })
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
            const result = {}
            // Reduce data, remove undefined properties.
            for (const key in data) if (data[key] === undefined) delete data[key]
            // If this is a layer, transform its array of neurons.
            if (Object.keys(data).length <= 2 && Array.isArray(data.n) && data.n.every(n => typeof n === "object")) result.n = data.n.map(neuron => neuron["#"])
            // If this is a layer without configs, just return its array of neurons.
            if (Object.keys(data).length === 1 && data.n) return result.n
            for (const key in data) {
                // Skip defined data.
                if (typeof result[key] !== "undefined") continue
                // Skip undefined data and empty array.
                if (data[key] === undefined || (Array.isArray(data[key]) && !data[key].length)) continue
                // If this is a neuron, ignore connection properties.
                if (data.inputs && data.outputs && (key === ">" || key === "<")) continue
                // If this is a connection, only return ids of "from" and "to" instead of full object.
                if (data.from && data.to && ["<", ">"].includes(key)) result[key] = data[key]["#"]
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
        // Restore non-objective properties.
        for (const key in data) if (typeof data[key] !== "object") this[key] = data[key]
        // Restore network neurons.
        data.n.forEach(item => this.neuron({ ...item }))
        // Restore network layers.
        data.l.forEach(item => {
            if (Array.isArray(item)) item = { n: item }
            item.n = item.n.map(neuron => this.neurons[neuron])
            this.layer({ ...item })
        })
        // Restore network connections.
        data.c.forEach(item => this.connect({ ...item }))
        return this
    }

    encoded(data = {}) {
        // Check if data is encoded.
        if (typeof data === "string") return true
        if (data?.l?.some(l => Array.isArray(l) || typeof l?.n !== "number")) return true
        if (data?.n?.some(n => isNaN(n["<"]) && isNaN(n[">"]))) return true
        if (data?.c?.some(c => isNaN(c["<"]) || isNaN(c[">"]))) return true
        return false
    }
}

export default Network
