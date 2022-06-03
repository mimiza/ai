import Layer from "./Layer.js"

class Network {
    constructor() {
        this.layers = new Map()
    }

    createLayer(config = {}) {
        const layer = new Layer(config)
        this.layers.set(layer.id, layer)
    }

    connect() {}

    backup() {
        // Create JSON data representing the whole network.
    }

    restore() {
        // Restore the whole network from given JSON data.
    }
}

export default Network
