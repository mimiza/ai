class Evolution {
    constructor(config = {}) {
        this.population = config.population || config || []
        // Coefficients for compatibility calculation.
        this.ec = config.ec || config.excessCoefficient || 1
        this.wdc = config.wdc || config.weightDifferenceCoefficient || 0.5
        this.ct = config.ct || config.compatibilityThreshold || 3
    }

    get excessCoefficient() {
        return this.ec
    }

    set excessCoefficient(value) {
        this.ec = value
        return this.ec
    }

    get weightDifferenceCoefficient() {
        return this.wdc
    }

    set weightDifferenceCoefficient(value) {
        this.wdc = value
        return this.wdc
    }

    get compatibilityThreshold() {
        return this.ct
    }

    set compatibilityThreshold(value) {
        this.ct = value
        return this.ct
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //sorts the species by fitness
    sortSpecies() {
        var temp = [] // new ArrayList < Player > ();

        //selection short
        for (var i = 0; i < this.players.length; i++) {
            var max = 0
            var maxIndex = 0
            for (var j = 0; j < this.players.length; j++) {
                if (this.players[j].fitness > max) {
                    max = this.players[j].fitness
                    maxIndex = j
                }
            }
            temp.push(this.players[maxIndex])

            this.players.splice(maxIndex, 1)
            // this.players.remove(maxIndex);
            i--
        }

        // this.players = (ArrayList) temp.clone();
        arrayCopy(temp, this.players)
        if (this.players.length == 0) {
            this.staleness = 200
            return
        }
        //if new best player
        if (this.players[0].fitness > this.bestFitness) {
            this.staleness = 0
            this.bestFitness = this.players[0].fitness
            this.rep = this.players[0].brain.clone()
            this.champ = this.players[0].cloneForReplay()
        } else {
            //if no new best player
            this.staleness++
        }
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //simple stuff
    setAverage() {
        var sum = 0
        for (var i = 0; i < this.players.length; i++) {
            sum += this.players[i].fitness
        }
        this.averageFitness = sum / this.players.length
    }
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //gets baby from the this.players in this species
    giveMeBaby(innovationHistory) {
        var baby
        if (random(1) < 0.25) {
            //25% of the time there is no crossover and the child is simply a clone of a random(ish) player
            baby = this.selectPlayer().clone()
        } else {
            //75% of the time do crossover

            //get 2 random(ish) parents
            var parent1 = this.selectPlayer()
            var parent2 = this.selectPlayer()

            //the crossover function expects the highest fitness parent to be the object and the lowest as the argument
            if (parent1.fitness < parent2.fitness) {
                baby = parent2.crossover(parent1)
            } else {
                baby = parent1.crossover(parent2)
            }
        }
        baby.brain.mutate(innovationHistory) //mutate that baby brain
        return baby
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //selects a player based on it fitness
    selectPlayer() {
        var fitnessSum = 0
        for (var i = 0; i < this.players.length; i++) {
            fitnessSum += this.players[i].fitness
        }
        var rand = random(fitnessSum)
        var runningSum = 0

        for (var i = 0; i < this.players.length; i++) {
            runningSum += this.players[i].fitness
            if (runningSum > rand) {
                return this.players[i]
            }
        }
        //unreachable code to make the parser happy
        return this.players[0]
    }
    //------------------------------------------------------------------------------------------------------------------------------------------
    //kills off bottom half of the species
    cull() {
        if (this.players.length > 2) {
            for (var i = this.players.length / 2; i < this.players.length; i++) {
                // this.players.remove(i);
                this.players.splice(i, 1)
                i--
            }
        }
    }
    //------------------------------------------------------------------------------------------------------------------------------------------
    //in order to protect unique this.players, the fitnesses of each player is divided by the number of this.players in the species that that player belongs to
    fitnessSharing() {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].fitness /= this.players.length
        }
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

        const compatibility = (this.excessCoefficient * unmatching) / normalizer + this.weightDiffCoeff * averageWeightDifference //compatibility formula
        return this.compatibilityThreshold > compatibility
    }

    speciate(population = this.population) {
        const species = []
        population.forEach(individual => {
            const speciate = species.filter(s => {
                if (s.length) {
                    // Choose a random individual from the species.
                    const represent = s[Math.floor(Math.random() * s.length)]
                    const compare = this.compare(individual, represent)
                    if (compare) return s.push(individual)
                }
                return false
            })
            if (!speciate) species.push([individual])
        })
        return species
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
}

export default Evolution
