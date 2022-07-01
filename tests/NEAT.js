import Ecosystem from "../Ecosystem.js"
import Network from "../Network.js"

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

let generation = 0
const size = 20
let creatures = []

for (let i = 0; i < size; i++) {
    const creature = new Network({ layers: [2, 0, 1] })
    creatures.push(creature)
}

const evolve = (data, config = {}) => {
    generation++
    creatures.forEach(creature => {
        // Do exams to get error. Error indicates how far we are to the goal. Smaller is better.
        const error = data.map(item => item.output[0] - creature.calculate(item.input)[0]).reduce((value, item) => (value += Math.abs(item)), 0) / data.length
        // Calculate fitness using error. Greater is better.
        creature.fitness = 1 - error
    })
    const ecosystem = new Ecosystem({ population: creatures, size })
    console.log("GENERATION", generation, "FITNESS", ecosystem.averageFitness())
    // If goal is achieved, return the best individual.
    if (ecosystem.averageFitness() >= 0.9) return ecosystem.best()
    // If goal is not achieved, continue the circle of life.
    ecosystem.speciate()
    ecosystem.generate()
    creatures = [...ecosystem.population]
    return evolve(data, config)
}

const testXOR = evolve(XOR)

console.log("XOR", testXOR)
