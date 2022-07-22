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

const AND = [
    { input: [0, 1], output: [0] },
    { input: [1, 0], output: [0] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [1] }
]

const OR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [1] }
]

const RAND = [
    { input: [0, 1], output: [0] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [1] },
    { input: [1, 1], output: [0] }
]

let run = 1
let ecosystem
let generation = 0
const size = 100
let creatures = []

const data = OR

if (typeof document !== "undefined") {
    document.querySelector("#start").onclick = () => {
        run = 1
        evolve(data)
    }
    document.querySelector("#stop").onclick = () => {
        run = 0
        console.log(ecosystem)
    }
}

for (let i = 0; i < size; i++) {
    const creature = new Network({ layers: [2, 0, 1] })
    creatures.push(creature)
}

const evolve = (data, config = {}) => {
    if (run === 0) return
    generation++
    creatures.forEach(creature => {
        // Do exams to get error. Error indicates how far we are to the goal. Smaller is better.
        const error = data.map(item => Math.pow(item.output[0] - creature.calculate(item.input)[0], 2)).reduce((value, item) => (value += item), 0)
        // Calculate fitness using error. Greater is better.
        creature.fitness = data.length - error
        creature.error = error
    })

    ecosystem = new Ecosystem({ compatibility: 3, population: creatures, size })
    const best = ecosystem.best()
    if (visualization) visualization.present(best)
    // If goal is achieved, return the best individual.
    if (ecosystem.averageFitness() >= 0.9 * data.length) return console.log(best)
    // If goal is not achieved, continue the circle of life.
    ecosystem.speciate()
    ecosystem.generate()
    console.clear()
    const text = `
GENERATION: ${generation}
POPULATION: ${ecosystem.population.length}
SPECIES: ${ecosystem.species.length}
FITNESS: ${ecosystem.averageFitness().toFixed(3)}
BEST FIT: ${best.fitness.toFixed(3)}
ERROR: ${best.error.toFixed(3)}
LAYERS: ${best.layers.length}
NEURONS: ${best.n.length}
CONNECTIONS: ${best.c.length}
INPUTS: ${data.map(item => item.input.join("-")).join(", ")}
TEST RESULT: ${data.map(item => best.calculate(item.input)[0].toFixed(3)).join(", ")}
EXPECTED RESULT: ${data.map(item => item.output[0]).join(", ")}`
    console.log(text)
    if (visualization) document.querySelector("#info").textContent = text
    // Reset fitnesses.
    ecosystem.population.forEach(individual => (individual.fitness = 0))
    creatures = [...ecosystem.population]
    setTimeout(() => evolve(data, config), 0)
}

evolve(data)
