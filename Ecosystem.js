import Network from "./Network.js"
import { random } from "./Utils.js"

class Ecosystem {
    constructor(config = {}) {
        this.mutation = {
            layer: 0.001,
            neuron: { rate: 0.01, enable: 0.01, disable: 0.001 },
            bias: { rate: 0.01, min: -30, max: 30 },
            connection: { rate: 0.1, enable: 0.01, disable: 0.001 },
            node: 0.01,
            weight: { rate: 0.01, min: -30, max: 30 },
            ...config?.mutation
        }
        this.population = config.population || config || [] // Population.
        this.species = config.species || [] // Species.
        this.size = config.size || 100 // Population size.
        // Coefficients for compatibility calculation.
        this.edc = config.edc || config.excessDisjointCoefficient || 1 // Excess and disjoint coefficient.
        this.wdc = config.wdc || config.weightDifferenceCoefficient || 0.5 // Weight difference coefficient.
        this.compatibility = config.compatibility || 3 // Compatibility threshold.
    }

    best(population = this.population) {
        return [...population].sort((a, b) => b.fitness - a.fitness).shift()
    }

    averageFitness(population = this.population) {
        return population.reduce((value, individual) => (value += individual.fitness), 0) / population.length
    }

    compare(N1 = {}, N2 = {}) {
        let matching = 0 // The number of matching connection genes.
        let weightDifference = 0 // Total weight difference.
        N1.connections.forEach(C1 =>
            N2.connections.forEach(C2 => {
                if (C1.from.id === C2.from.id && C1.from.activator === C2.from.activator && C1.to.id === C2.to.id && C1.to.activator === C2.to.activator) {
                    matching++
                    weightDifference += Math.abs(C1.weight - C2.weight)
                }
            })
        )
        const unmatching = N1.connections.length + N2.connections.length - 2 * matching // The number of unmatching connections.
        const awd = matching === 0 ? 100 : weightDifference / matching // Average weight difference. Return 100 if matching === 0 to avoid division by 0 error.
        const normalizer = Math.max(N1.connections.length + N2.connections.length, 1)
        const compatibility = (this.edc * unmatching) / normalizer + this.wdc * awd // Compatibility formula.
        return this.compatibility > compatibility
    }

    speciate(population = this.population) {
        this.species = []
        population.forEach(individual => {
            let speciated = false
            for (const species of this.species)
                if (species.length) {
                    // Choose a random representative sample from the species.
                    const sample = species[Math.floor(Math.random() * species.length)]
                    const compare = this.compare(individual, sample)
                    if (compare) {
                        species.push(individual)
                        speciated = true
                        break
                    }
                }
            // If no species found, create a new species for this individual.
            if (!speciated) this.species.push([individual])
        })
        return this.species
    }

    select(species = []) {
        species.sort((a, b) => b.fitness - a.fitness)
        const seed = Math.random()
        if (seed < 0.25) return species[0]
        if (seed < 0.375 && species.length > 1) return species[1]
        if (seed < 0.5 && species.length > 2) return species[2]
        const threshold = Math.random() * species.reduce((value, individual) => (value += individual.fitness), 0)
        let sum = 0
        return (
            species.find(individual => {
                sum += individual.fitness
                if (sum > threshold) return true
            }) || random(species)
        )
    }

    crossover(...parents) {
        if (!parents.length || parents.some(parent => typeof parent !== "object")) return

        parents = parents.map(parent => parent.encode())

        const child = { l: [], n: [], c: [] }

        parents.forEach(parent => {
            // Copy non-objective properties.
            Object.keys(parent).forEach(key => {
                const values = parents.filter(item => !["undefined", "object"].includes(typeof item[key]) && typeof child[key] === "undefined").map(item => item[key])
                if (values.length) child[key] = random(values)
            })

            parent.l.forEach((item, index) => {
                // Get all layers that have the 'index' of 'layer' but don't exist in child.l.
                const layers = parents.filter(item => typeof item.l[index] !== "undefined" && typeof child.l[index] === "undefined").map(item => item.l[index])
                const layer = random(layers)
                if (Array.isArray(layer)) child.l.push([])
                else if (typeof layer === "object") child.l.push({ ...layer, n: [] })
            })

            parent.n.forEach(neuron => {
                // Get all neurons that matches # of 'neuron' but don't exist in child.n.
                const match = n => n["#"] === neuron["#"]
                const neurons = parents.filter(item => item.n.some(match) && !child.n.some(match)).map(item => item.n.find(match))
                if (neurons.length) child.n.push(random(neurons))
            })

            parent.c.forEach(connection => {
                // Get all connections that matches '<' and '>' of 'connection' but don't exist in child.c.
                const match = c => c["<"] === connection["<"] && c[">"] === connection[">"]
                const connections = parents.filter(item => item.c.some(match) && !child.c.some(match)).map(item => item.c.find(match))
                if (connections.length) child.c.push(random(connections))
            })
        })

        child.n.forEach(neuron => {
            const indexes = parents
                .filter(item => item.n.some(n => n["#"] === neuron["#"]))
                .map(item => {
                    const index = item.l.findIndex(l => l.includes(neuron["#"]))
                    // Return the index of the last layer of child if this neuron belongs to the last layer of its network.
                    if (index === item.l.length - 1) return child.l.length - 1
                    // By default, return the normal index.
                    return index
                })
            // Put the neuron to the first layer, or the last layer, or a random layer between the first and the last layers.
            const index = indexes.includes(0) ? 0 : indexes.includes(child.l.length - 1) ? child.l.length - 1 : random(indexes)
            const layer = child.l[index]?.n || child.l[index]
            layer.push(neuron["#"])
        })

        return new Network(child)
    }

    mutate(network) {
        const activators = ["sigmoid", "relu", "tanh"]

        // Add new random layer.
        if (Math.random() < this.mutation.layer && !network.layers.filter(l => !l.n.length).length) network.layer({ index: random(1, network.layers.length - 2) })

        // Add new random neuron.
        if (Math.random() < this.mutation.neuron.rate) network.neuron({ layer: random(1, network.layers.length - 2), activator: random(activators) })

        // Add new random connection.
        if (Math.random() < this.mutation.connection.rate) {
            const from = random(network.neurons)
            const to = random(network.neurons)
            if (!network.connections.some(c => c.from.id === from.id && c.to.id === to.id)) network.connect({ from, to })
        }

        // Add new random node between a connection.
        if (Math.random() < this.mutation.node && network.connections.length) {
            const connection = random(network.connections.filter(connection => connection.state))
            const neuron = network.neuron({ layer: random(1, network.layers.length - 2), activator: random(activators) })
            connection.state = false
            network.connect({ from: connection.from, to: neuron.id })
            network.connect({ from: neuron.id, to: connection.to })
        }

        network.neurons.forEach(neuron => {
            // Change random neuron biases.
            if (Math.random() < this.mutation.bias.rate) neuron.bias += neuron.bias * random(0.01, 0.2) * random([-1, 1])
            // Enable random neuron.
            if (!neuron.state && Math.random() < this.mutation.neuron.enable && ![...network.layers[0].n, ...network.layers[network.layers.length - 1].n].some(n => n.id === neuron.id)) neuron.state = true
            // Disable random neuron.
            if (neuron.state && Math.random() < this.mutation.neuron.disable && ![...network.layers[0].n, ...network.layers[network.layers.length - 1].n].some(n => n.id === neuron.id)) neuron.state = false
        })

        network.connections.forEach(connection => {
            // Change random connection weight.
            if (Math.random() < this.mutation.weight.rate) connection.weight += connection.weight * random(0.01, 0.5) * random([-1, 1])
            // Enable random connections.
            if (!connection.state && Math.random() < this.mutation.connection.enable) connection.state = true
            // Disable random connections.
            if (connection.state && Math.random() < this.mutation.connection.disable) connection.state = false
        })
    }

    generate() {
        const generation = []
        // Calculate average fitness of the entire population.
        const populationFitness = this.averageFitness()
        const sizes = this.species.map(species => Math.ceil((this.averageFitness(species) / populationFitness) * species.length))
        const total = sizes.reduce((value, size) => (value += size), 0)
        this.species.forEach((species, index) => {
            const size = (sizes[index] * this.size) / total
            for (let i = 0; i < size; i++) {
                // Select parents and crossover.
                const father = this.select(species)
                const mother = this.select(species)
                const child = this.crossover(father, mother)
                this.mutate(child)
                generation.push(child)
            }
        })
        this.population = generation
        while (this.size < this.population.length) this.population.splice(Math.floor(Math.random() * this.population.length), 1)
        this.speciate()
    }
}

export default Ecosystem
