import Network from "./Network.js"
import { random } from "./Utils.js"

class Ecosystem {
    constructor(config = {}) {
        this.population = config.population || config || [] // Population.
        this.species = config.species || [] // Species.
        this.size = config.size || 100 // Population size.
        // Coefficients for compatibility calculation.
        this.edc = config.edc || config.excessDisjointCoefficient || 1 // Excess and disjoint coefficient.
        this.wdc = config.wdc || config.weightDifferenceCoefficient || 0.5 // Weight difference coefficient.
        this.compatibility = config.compatibility || 0.1 // Compatibility threshold.
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
        return species.find(individual => {
            sum += individual.fitness
            if (sum > threshold) return true
        })
    }

    // crossover(...parents) {
    //     if (!parents.length || parents.some(parent => typeof parent !== "object")) return
    //     // Sort parents by fitness.
    //     parents = parents.sort((a, b) => b.fitness - a.fitness).map(parent => parent.encode())
    //     // Child looks more like the parent who performs better.
    //     const child = new Network(parents.shift())
    //     // Get genes from the rest parents and merge into the child.
    //     parents.forEach(parent => {
    //         // Copy non-objective properties.
    //         for (const key in parent) if (!Object.keys(child).includes(key) && typeof parent[key] !== "object") child[key] = parent[key]
    //         // Copy hidden layer's neurons.
    //         const hidden = parent.l[1].n || parent.l[1]
    //         hidden.forEach(N1 => {
    //             if (!child.layers[1].n.some(N2 => N1 === N2["#"])) child.neuron({ layer: 1, ...N1 })
    //             else if (Math.random() < 0.5 && child.neurons[N1["#"]]) child.neurons[N1["#"]] = { ...child.neurons[N1["#"]], ...N1 }
    //         })
    //         // Copy connections.
    //         parent.c.forEach(C1 => {
    //             const connection = child.c.find(C2 => C1["<"] === C2["<"]["#"] && C1[">"] === C2[">"]["#"])
    //             if (!connection) child.connect(C1)
    //             else if (Math.random() > 0.5 && connection) connection.w = C1.w
    //         })
    //     })
    //     return child
    // }

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
                child.mutate()
                generation.push(child)
            }
        })
        this.population = generation
        while (this.size < this.population.length) this.population.splice(Math.floor(Math.random() * this.population.length), 1)
    }
}

export default Ecosystem
