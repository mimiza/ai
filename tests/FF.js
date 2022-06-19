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

const test = (...args) => console.log("TEST:", args[0], "-", args[1] ? "OK" : "FAIL")

test("XOR sigmoid", testIO(XOR))
test("OR sigmoid", testIO(OR))
test("AND sigmoid", testIO(AND))
test("RAND sigmoid", testIO(RAND))

test("XOR relu", testIO(XOR, { activator: "relu" }))
test("OR relu", testIO(OR, { activator: "relu" }))
test("AND relu", testIO(AND, { activator: "relu" }))
test("RAND relu", testIO(RAND, { activator: "relu" }))

test("XOR mixed", testIO(XOR, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
test("OR mixed", testIO(OR, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
test("AND mixed", testIO(AND, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))
test("RAND mixed", testIO(RAND, { layers: [{ neurons: 2, activator: "relu" }, { neurons: 10, activator: "relu" }, 1] }))

test("XOR encode/decode", testEncodeDecode(XOR))
test("OR encode/decode", testEncodeDecode(OR))
test("AND encode/decode", testEncodeDecode(AND))
test("RAND encode/decode", testEncodeDecode(RAND))
