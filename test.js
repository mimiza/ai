import { random } from "./Utils.js"
import Network from "./Network.js"

const crossover = (...parents) => {
    const child = { l: [], n: [], c: [] }

    parents.forEach(parent => {
        // Copy non-objective properties.
        Object.keys(parent).forEach(key => {
            const values = parents.filter(item => !["undefined", "object"].includes(typeof item[key]) && typeof child[key] === "undefined").map(item => item[key])
            if (values.length) child[key] = random(values)
        })

        parent.l.forEach((item, index) => {
            // Get all layers that have the 'index' of 'layer' but don't exist in child.l.
            const layers = parents.filter(item => typeof item.l[index] !== "undefined" && typeof child.l[index] === "undefined").map(item => item.l[index])
            const layer = random(layers)
            if (Array.isArray(layer)) child.l.push([])
            else if (typeof layer === "object") child.l.push({ ...layer, n: [] })
        })

        parent.n.forEach(neuron => {
            // Get all neurons that matches # of 'neuron' but don't exist in child.n.
            const match = n => n["#"] === neuron["#"]
            const neurons = parents.filter(item => item.n.some(match) && !child.n.some(match)).map(item => item.n.find(match))
            if (neurons.length) child.n.push(random(neurons))
        })

        parent.c.forEach(connection => {
            // Get all connections that matches '<' and '>' of 'connection' but don't exist in child.c.
            const match = c => c["<"] === connection["<"] && c[">"] === connection[">"]
            const connections = parents.filter(item => item.c.some(match) && !child.c.some(match)).map(item => item.c.find(match))
            if (connections.length) child.c.push(random(connections))
        })
    })

    child.n.forEach(neuron => {
        const indexes = parents
            .filter(item => item.n.some(n => n["#"] === neuron["#"]))
            .map(item => {
                const index = item.l.findIndex(l => l.includes(neuron["#"]))
                // Return the index of the last layer of child if this neuron belongs to the last layer of its network.
                if (index === item.l.length - 1) return child.l.length - 1
                // By default, return the normal index.
                return index
            })
        // Put the neuron to the first layer, or the last layer, or a random layer between the first and the last layers.
        const index = indexes.includes(0) ? 0 : indexes.includes(child.l.length - 1) ? child.l.length - 1 : random(indexes)
        const layer = child.l[index].n || child.l[index]
        layer.push(neuron["#"])
    })

    return child
}

const a = new Network({ layers: [2, 2, 5, 2] }).encode()
const b = new Network({ layers: [2, 0, 3, 0, 2, 0, 2] }).encode()
const c = new Network(crossover(a, b))

console.log(c.encode())
