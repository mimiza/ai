class Layer {
    constructor(config = {}) {
        this.n = []
        this.a = config.a || config.activator
    }

    get neurons() {
        return this.n
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
