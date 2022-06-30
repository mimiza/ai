import Network from "./Network.js"

class Ecosystem {
    constructor(config = {}) {
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
        population.forEach(individual => {
            let speciated = false
            for (const species of this.species) {
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
            }
            // If no species found, create a new species for this individual.
            if (!speciated) this.species.push([individual])
        })
        return this.species
    }

    crossover(...parents) {
        if (parents.some(parent => typeof parent === "undefined")) return
        // Sort parents by fitness.
        parents.sort((a, b) => b.fitness - a.fitness).map(parent => parent.encode())
        // Child looks more like the parent who performs better.
        const child = new Network(parents.shift())
        // Get genes from the rest parents and merge into the child.
        parents.forEach(parent => {
            // Copy none object properties.
            for (const key in parent) if (typeof child[key] === "undefined" && typeof parent[key] !== "object") child[key] = parent[key]
            // Copy hidden layer's neurons.
            const hidden = parent.l[1].n || parent.l[1]
            hidden.forEach(N1 => {
                if (!child.layers[1].neurons.filter(N2 => N1["#"] === N2["#"]).length) child.neuron({ layer: 1, ...N1 })
            })
            // Copy connections.
            parent.c.forEach(C1 => {
                if (!child.connections.filter(C2 => C1["<"] === C2["<"]["#"] && C1[">"] === C2[">"]["#"]).length) child.connect(C1)
            })
        })
        return child
    }

    generate() {
        // THIS NEEDS TO BE FIXED!
        // Calculate average fitness of the entire population.
        const populationFitness = this.averageFitness()
        this.species.forEach(species => {
            // Sort individuals by fitness.
            species.sort((a, b) => b.fitness - a.fitness)
            // Calculate average fitness of each individual in the species.
            const speciesFitness = this.averageFitness(species)
            const speciesSize = Math.ceil((speciesFitness / populationFitness) * species.length)
            const generation = []
            for (let i = 0; i < speciesSize; i++) {
                // Select parents and crossover.
                const child = this.crossover(this.select(species), this.select(species))
                child.mutate()
                generation.push(child)
                // Kill the old individuals on the bottom half of the species to save computing energy.
                // This should be fixed. Species is just a standalone array.
                species.splice(Math.floor(Math.random() * (species.length / 2) + species.length / 2), 1)
            }
        })
    }

    select(species) {
        const sorted = [...species].sort((a, b) => b.fitness - a.fitness)
        const seed = Math.random()
        if (seed < 0.25) return sorted[0]
        if (seed < 0.375 && species.length > 1) return sorted[1]
        if (seed < 0.5 && species.length > 2) return sorted[2]
        const threshold = Math.random() * species.reduce((value, individual) => (value += individual.fitness), 0)
        let sum = 0
        return species.find(individual => {
            sum += individual.fitness
            if (sum > threshold) return true
        })
    }
}

export default Ecosystem
