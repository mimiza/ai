import Connection from "./Connection.js"
import Layer from "./Layer.js"

class Network {
    constructor(config = {}) {
        if (typeof config === "string") return this.decode(config) // Try to decode if type of config is "string" instead of "object".
        this.l = []
        this.t = config.t || config.type || "ff" // Network type, "ff" for feedforward, "neat" for NEAT.
        this.a = config.a || config.activator || "sigmoid"
        this.r = config.r || config.rate || 0.01
        this.m = config.m || config.momentum || 0.01
        this.i = config.i || config.iterations || 0
        const layers = config.l || config.layers
        if (Array.isArray(layers)) layers.forEach(layer => this.layer(layer))
        this.connect()
    }

    get layers() {
        return this.l
    }

    set layers(value) {
        this.l = value
        return this.l
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

    get output() {
        return [...this.layers].pop().neurons.map(n => n.output)
    }

    layer(config = {}) {
        const layer = new Layer(config)
        if (layer) this.layers.push(layer)
        return layer
    }

    connect(L1, L2) {
        if (L1 && L2) return L1.neurons.forEach(from => L2.neurons.forEach(to => new Connection({ from, to })))
        // If network type is NEAT, connect the first and last layers.
        if (this.type === "neat") return this.connect(this.layers[0], this.layers[this.layers.length - 1])
        // Connect each layer's neurons with its surrouding layers' neurons.
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            this.connect(this.layers[index - 1], layer)
        })
    }

    train(input = [], output = []) {
        this.input(input)
        this.propagate()
        this.backpropagate(output)
        this.iterations++
    }

    calculate(input = []) {
        this.input(input)
        return this.propagate()
    }

    input(input = []) {
        this.layers[0].neurons.forEach((neuron, index) => (neuron.output = input[index]))
    }

    activate(input, activator) {
        return this[activator || this.activator](input)
    }

    propagate() {
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            layer.neurons.forEach(neuron => {
                // Multiply weights and outputs, then summarize all together.
                const sum = neuron.inputs.reduce((value, connection) => value + connection.weight * connection.from.output, 0) + neuron.bias
                const activator = neuron.activator || layer.activator || this.activator
                neuron.output = this.activate(sum, activator)
            })
        })
        // Return the output layer.
        return this.output
    }

    backpropagate(target) {
        ;[...this.layers].reverse().forEach((layer, i) =>
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

    sigmoid(x = 0) {
        return 1 / (1 + Math.exp(-x))
    }

    relu(x = 0) {
        return Math.max(0, x)
    }

    encode(data = this) {
        if (Array.isArray(data)) return data.map(d => this.encode(d))
        if (typeof data === "object") {
            // If this is a layer without any configs, just return an array of its neurons.
            if (Object.keys(data).length === 1 && Array.isArray(data.n)) return this.encode(data.n)
            const result = {}
            for (const key in data) {
                // Skip undefined key
                if (typeof data[key] === "undefined") continue
                // If this is a neuron, ignore output connection array, as well as empty input connection array.
                if (data["#"] && (key === ">" || (key === "<" && !data[key].length))) continue
                // If this is a connection, only return ids of "from" and "to" instead of full object.
                if (!data["#"] && ["<", ">"].includes(key)) result[key] = data[key].id
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

        // Reset network layers.
        this.layers = []
        for (const key in data) if (typeof data[key] !== "object") this[key] = data[key]
        // Decode network layers.
        data.l.forEach((item, index) => {
            const layer = this.layer(item)
            if (index === 0) return
            // Connect neurons together.
            layer.neurons.forEach(neuron => {
                const inputs = neuron.inputs
                // Reset connections.
                neuron.inputs = []
                neuron.outputs = []
                inputs.forEach(config => {
                    config[">"] = neuron
                    for (const item of this.layers[index - 1].neurons) {
                        if (item.id === config["<"]) {
                            config["<"] = item
                            return new Connection(config)
                        }
                    }
                })
            })
        })
        return this
    }
}

export default Network
