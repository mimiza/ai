import Connection from "./Connection.js"
import Layer from "./Layer.js"

class Network {
    constructor(config = {}) {
        this.l = []
        this.a = config.a || config.activator || "sigmoid"
        this.r = config.r || config.rate || 0.1
        this.m = config.m || config.momentum || 0.1
        this.i = config.i || config.iterations || 0
        if (Array.isArray(config.layers)) config.layers.forEach(layer => this.createLayer(layer))
        this.connect()
    }

    get layers() {
        return this.l
    }

    set layers(value) {
        this.l = value
        return this.l
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

    createLayer(config = {}) {
        const layer = new Layer(config)
        if (layer) return this.layers.push(layer)
    }

    connect(L1, L2) {
        if (L1 && L2) return L1.neurons.forEach(from => L2.neurons.forEach(to => new Connection({ "<": from, ">": to })))
        // Connect all the neurons of current layer with the neurons of its last layer.
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            this.connect(this.layers[index - 1], layer)
        })
    }

    train(input = [], output = []) {
        this.input(input)
        this.propagate()
        this.backpropagate(output)
        this.adjust()
        this.iterations++
    }

    calculate(input = []) {
        this.input(input)
        return this.propagate()
    }

    input(input = []) {
        this.layers[0].neurons.forEach((neuron, index) => (neuron.output = input[index]))
    }

    activate(input) {
        return this[this.activator](input)
    }

    propagate() {
        this.layers.forEach((layer, index) => {
            if (index === 0) return
            layer.neurons.forEach(neuron => {
                // Multiply weights and outputs, then summarize all together.
                const sum = neuron.inputs.reduce((value, connection) => value + connection.weight * connection.from.output, 0)
                neuron.output = this.activate(sum + neuron.bias)
            })
        })
        // Return the output layer.
        return [...this.layers].pop().neurons.map(n => n.output)
    }

    backpropagate(target) {
        return [...this.layers].reverse().forEach((layer, i) =>
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
                neuron.bias += this.rate * neuron.delta
            })
        })
    }

    sigmoid(x = 0) {
        return 1 / (1 + Math.exp(-x))
    }

    ReLU(x = 0) {
        return Math.max(0, x)
    }

    structure(data = this) {
        if (Array.isArray(data)) return data.map(d => this.structure(d))
        if (typeof data === "object") {
            // If this is a layer, just return an array of its neurons.
            if (Array.isArray(data.n)) return this.structure(data.n)
            const result = {}
            for (const key in data) {
                // If this is a neuron, ignore output connection array, as well as empty input connection array.
                if (data["#"] && (key === ">" || (key === "<" && !data[key].length))) continue
                // If this is a connection, only return ids for from and to instead of full object.
                if (!data["#"] && ["<", ">"].includes(key)) result[key] = data[key].id
                else result[key] = this.structure(data[key])
            }
            return result
        }
        return data
    }

    restore(data = {}) {
        // Restore the whole network from given JSON data.
        // Reset network layers.
        this.layers = []
        for (const key in data) {
            if (typeof data[key] !== "object") this[key] = data[key]
            // Restore network layers.
            data.l.forEach((item, index) => {
                const layer = this.createLayer(item)
                if (index === 0) return
                // Connect neurons together.
                // const last = this.layers[index - 1]
                layer.neurons.forEach(neuron => {
                    neuron.inputs.forEach(config => {
                        // Restore connections.
                    })
                })
            })
        }
    }
}

export default Network
