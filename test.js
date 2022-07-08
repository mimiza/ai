import { random } from "./Utils.js"

const crossover = (...parents) => {
    const child = { l: [], n: [], c: [] }
    parents.forEach(parent => {
        // Copy non-objective properties.
        for (const key in parent) {
            const values = parents.filter(item => !["undefined", "object"].includes(typeof item[key]) && typeof child[key] === "undefined").map(item => item[key])
            if (values.length) child[key] = random(values)
        }

        parent.n.forEach(neuron => {
            // Get all neurons that matches # of 'neuron' but doesn't exist in child.n.
            const match = n => n["#"] === neuron["#"]
            const neurons = parents.filter(item => item.n.some(match) && !child.n.some(match)).map(item => item.n.find(match))
            if (neurons.length) child.n.push(random[neurons])
        })

        parent.c.forEach(connection => {
            // Get all connections that matches '<' and '>' of 'connection' but doesn't exist in child.c.
            const match = c => c["<"] === connection["<"] && c[">"] === connection[">"]
            const connections = parents.filter(item => item.c.some(match) && !child.c.some(match)).map(item => item.c.find(match))
            if (connections.length) child.c.push(random[connections])
        })

        // Create layers.
        while (child.l.length < parent.l.length) child.l.push({ n: [] })

        // Normalize layers.
        parent.l = parent.l.map(item => {
            if (Array.isArray(item)) item = { n: item }
            return item
        })
    })
}
