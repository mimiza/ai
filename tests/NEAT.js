import Ecosystem from "../Ecosystem.js"
import Network from "../Network.js"
import Visualization from "../Visualization.js"
import exams from "./exams.js"

const visualization = typeof document !== "undefined" ? new Visualization({ svg: document.querySelector("#visualization") }) : undefined

let run = true
let ecosystem
let generation = 0
const size = 100
let population = []
const config = {
    compatibility: 3,
    edc: 1.5,
    wdc: 0.5,
    size,
    mutation: {
        layer: 0.001,
        neuron: { rate: 0.001, max: 10, enable: 0.01, disable: 0.001 },
        bias: { rate: 0.1, range: [0, 2] },
        connection: { rate: 0.01, enable: 0.01, disable: 0.001 },
        node: 0.5,
        weight: { rate: 0.1, range: [0, 2] }
    }
}

const exam = typeof process !== "undefined" ? process.argv[2] || "XOR" : new URLSearchParams(window.location.search).get("exam") || "XOR"
const data = exams[exam]

if (typeof document !== "undefined") {
    document.querySelector("#start").onclick = () => {
        run = true
        evolve(data)
    }
    document.querySelector("#stop").onclick = () => {
        run = false
        console.log(ecosystem)
    }
}

for (let i = 0; i < size; i++) {
    const creature = new Network({ layers: [2, 0, 1] })
    population.push(creature)
}

const evolve = data => {
    if (run === false) return
    generation++
    population.forEach(creature => {
        // Do exams to get error. Error indicates how far we are to the goal. Smaller is better.
        const error = data.map(item => Math.pow(item.output[0] - creature.calculate(item.input)[0], 2)).reduce((value, item) => (value += item), 0)
        // Calculate fitness using error. Greater is better.
        creature.fitness = data.length - error
        creature.error = error
    })

    ecosystem = new Ecosystem({ population, ...config })
    const best = ecosystem.best()
    if (visualization) visualization.present(best)
    // If goal is achieved, return the best individual.
    if (best.fitness >= 0.99 * data.length) return console.log({ best, ecosystem })
    // If goal is not achieved, continue the circle of life.
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
    population = [...ecosystem.population]
    setTimeout(() => evolve(data), 0)
}

evolve(data)
