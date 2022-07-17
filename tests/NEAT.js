import Ecosystem from "../Ecosystem.js"
import Network from "../Network.js"
import Visualization from "../Visualization.js"

const visualization = typeof document !== "undefined" ? new Visualization({ svg: document.querySelector("#visualization") }) : undefined

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

let generation = 0
const size = 100
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
        creature.error = error
    })
    const ecosystem = new Ecosystem({ population: creatures, size })
    const best = ecosystem.best()
    if (visualization) visualization.present(best)
    // If goal is achieved, return the best individual.
    if (ecosystem.averageFitness() >= 0.9) return console.log(best.encode())
    // If goal is not achieved, continue the circle of life.
    ecosystem.speciate()
    ecosystem.generate()
    console.clear()
    const text = `GENERATION: ${generation}
POPULATION: ${ecosystem.population.length}
SPECIES: ${ecosystem.species.length}
FITNESS: ${ecosystem.averageFitness().toFixed(3)}
BEST FIT: ${best.fitness.toFixed(3)} - ERROR: ${best.error.toFixed(3)} - LAYERS: ${best.layers.length} - NEURONS: ${best.n.length} - CONNECTIONS: ${best.c.length}
TEST RESULT: ${data.map(item => best.calculate(item.input)[0].toFixed(3))}`
    console.log(text)
    if (visualization) document.querySelector("#info").textContent = text
    // Reset fitnesses.
    ecosystem.population.forEach(individual => (individual.fitness = 0))
    creatures = [...ecosystem.population]
    setTimeout(() => evolve(data, config), 0)
}

evolve(XOR)
