import Network from "./Network.js"

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

const test = data => {
    const results = []
    const network = new Network({ layers: [2, 10, 10, 1] })
    for (let i = 0; i < 5000; i++) data.forEach(d => network.train(d.input, d.output))

    for (let i = 0; i < 10; i++)
        data.forEach(d => {
            const r = network.calculate(d.input)
            results.push({ input: d.input, output: Math.round(r[0]), accurate: Math.round(r[0]) === d.output[0] })
        })
    return results
}

const testjson = data => {
    const results = []
    const network = new Network({ layers: [2, 4, 4, 1], activator: "sigmoid" })
    for (let i = 0; i < 5000; i++) data.forEach(d => network.train(d.input, d.output))
    console.log(JSON.stringify(network.structure(), null, 2))
    return results
}

//console.log("RAND", test(XOR))
testjson(XOR)
