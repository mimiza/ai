import Evolution from "../Evolution.js"
import Network from "../Network.js"

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

const population = 100
const creatures = []

const evolve = (data, config = {}) => {
    for (let i = 0; i < population; i++) {
        const creature = new Network({ layers: [2, 0, 1], ...config })
        creatures.push(creature)
    }
    creatures.forEach(creature => creature.mutate())
    creatures.map(creature => (creature.fitness = data.filter(d => creature.calculate(d.input).map(Math.round)[0] === d.output[0]).length / data.length))
    creatures.map(creature => console.log(creature.fitness))
}

console.log("XOR", evolve(XOR))
