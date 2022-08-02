class Layer {
    constructor(config = {}) {
        this.n = Array.isArray(config) ? config : config.n || []
        this.a = typeof config.a !== "undefined" ? config.a : typeof config.activator !== "undefined" ? config.activator : undefined
    }

    get neurons() {
        return this.n.filter(n => n.state)
    }

    set neurons(value) {
        this.n = value
        return this.n
    }

    get activator() {
        return this.a
    }

    set activator(value) {
        this.a = value
        return this.a
    }
}

export default Layer
