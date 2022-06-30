import Evolution from "../Evolution.js"
import Network from "../Network.js"

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

const size = 100
let creatures = []

for (let i = 0; i < size; i++) {
    const creature = new Network({ layers: [2, 0, 1] })
    creature.connect({ from: creature.layers[0], to: creature.layers[2] })
    creature.mutate()
    creatures.push(creature)
}

const evolve = (data, config = {}) => {
    creatures.forEach(creature => {
        // Do exams to get error. Error means how far we are to the goal. Smaller is better.
        const error = data.map(item => item.output[0] - creature.calculate(item.input)[0]).reduce((value, item) => (value += Math.abs(item)), 0)
        // Calculate fitness using error. Greater is better.
        creature.fitness = 1 / error
    })
    const evolution = new Evolution({ population: creatures, size })
    // Now check if goal is reached?
    // If goal is achieved, return the best individual.

    // If goal is not achieved, continue the circle of life.
    evolution.speciate()
    evolution.generate()
    creatures = evolution.population
    return evolve()
}

console.log("XOR", evolve(XOR))
