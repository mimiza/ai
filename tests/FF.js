import Network from "../Network.js"

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

const testIO = (data, config = {}) => {
    const network = new Network({ layers: [2, 10, 1], ...config })
    for (let i = 0; i < 20000; i++) data.forEach(d => network.train(d.input, d.output))

    const test = data.every(d => {
        const r = network.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

const testEncodeDecode = (data, config = {}) => {
    const network = new Network({ layers: [2, 10, 1], ...config })
    for (let i = 0; i < 20000; i++) data.forEach(d => network.train(d.input, d.output))

    let encode = JSON.stringify(network.encode(), null, 2)
    const newNetwork = new Network(encode)

    const test = data.every(d => {
        const r = newNetwork.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

console.log("XOR sigmoid", testIO(XOR))
console.log("OR sigmoid", testIO(OR))
console.log("AND sigmoid", testIO(AND))
console.log("RAND sigmoid", testIO(RAND))

console.log("XOR relu", testIO(XOR, { activator: "relu" }))
console.log("OR relu", testIO(OR, { activator: "relu" }))
console.log("AND relu", testIO(AND, { activator: "relu" }))
console.log("RAND relu", testIO(RAND, { activator: "relu" }))

console.log("XOR mixed", testIO(XOR, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
console.log("OR mixed", testIO(OR, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
console.log("AND mixed", testIO(AND, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
console.log("RAND mixed", testIO(RAND, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))

console.log("XOR encode/decode", testEncodeDecode(XOR))
console.log("OR encode/decode", testEncodeDecode(OR))
console.log("AND encode/decode", testEncodeDecode(AND))
console.log("RAND encode/decode", testEncodeDecode(RAND))
