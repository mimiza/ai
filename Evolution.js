class Evolution {
    constructor(config = {}) {
        this.p = config.p || config.population || config || [] // Population.
        this.s = config.s || config.species || [] // Species.
        // Coefficients for compatibility calculation.
        this.e = config.e || config.excessDisjointCoefficient || 1 // Excess and disjoint coefficient.
        this.w = config.w || config.weightDifferenceCoefficient || 0.5 // Weight difference coefficient.
        this.c = config.c || config.compatibilityThreshold || 3 // Compatibility threshold.
    }

    get population() {
        return this.p
    }

    set population(value) {
        this.p = value
    }

    get species() {
        return this.s
    }

    set species(value) {
        this.s = value
    }

    get excessDisjointCoefficient() {
        return this.e
    }

    set excessDisjointCoefficient(value) {
        this.e = value
        return this.e
    }

    get weightDifferenceCoefficient() {
        return this.w
    }

    set weightDifferenceCoefficient(value) {
        this.w = value
        return this.w
    }

    get compatibilityThreshold() {
        return this.c
    }

    set compatibilityThreshold(value) {
        this.c = value
        return this.c
    }

    averageFitness(population = this.population) {
        return population.reduce((value, creature) => (value += creature.fitness), 0) / population.length
    }

    compare(N1 = {}, N2 = {}) {
        let matching = 0 // The number of matching connection genes.
        let weightDifference = 0 // Total weight difference.
        N1.c.forEach(c1 =>
            N2.c.forEach(c2 => {
                if (c1["<"]["#"] === c2["<"]["#"] && c1["<"].a === c2["<"].a && c1[">"]["#"] === c2[">"]["#"] && c1[">"].a === c2[">"].a) {
                    matching++
                    weightDiff += Math.abs(c1.w - c2.w)
                }
            })
        )
        const unmatching = N1.c.length + N2.c.length - 2 * matching // The number of unmatching connection genes.
        const averageWeightDifference = matching === 0 ? 100 : weightDifference / matching // Average weight difference. Return 100 if matching === 0 to avoid division by 0 error.
        const normalizer = Math.max(N1.c.length + N2.c.length, 1)

        const compatibility = (this.excessDisjointCoefficient * unmatching) / normalizer + this.weightDiffCoeff * averageWeightDifference //compatibility formula
        return this.compatibilityThreshold > compatibility
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
            if (!speciated) species.push([individual])
        })
        return this.species
    }

    crossover(parents = []) {
        // Sort parents by fitness.
        parents = parents.sort((a, b) => b.fitness - a.fitness)
        // Crossover neurons.
        const n = []
        const c = []
        parents.forEach(parent => {
            parent.n.forEach(neuron => {
                if (n.every(item => item["#"] !== neuron["#"])) n.push(neuron)
            })
            parent.c.forEach(connection => {
                if (c.every(item => item["<"] !== connection["<"] && item[">"] !== connection[">"])) c.push(connection)
            })
        })
        return { n, c }
    }

    mutate() {
        // Mutate node.
        // Mutate connections.
        // Muate weights.
    }

    generate() {
        // Calculate average fitness of the entire population.
        const averagePopulationFitness = this.averageFitness()
        this.species.forEach(species => {
            // Calculate average fitness of each individual in the species
        })
    }
}

export default Evolution
