class Sample {
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
}
