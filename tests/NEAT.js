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
        const creature = new Network({ neurons: { inputs: 2, outputs: 1 }, ...config })
        // creature.mutate()
        creatures.push(creature)
    }

    const results = creatures.map(creature =>
        data.every(d => {
            const r = creature.calculate(d.input)
            return r.map(Math.round)[0] === d.output[0]
        })
    )

    return results
}

console.log("XOR", evolve(XOR))
