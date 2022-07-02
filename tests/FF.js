import Network from "../Network.js"

const tests = []

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
    const network = new Network({ layers: [2, 0, 10, 0, 1], ...config })
    for (let i = 0; i < 80000; i++) {
        const item = data[Math.floor(Math.random() * data.length)]
        network.train(item.input, item.output)
    }

    const test = data.every(d => {
        const r = network.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

const testEncodeDecode = (data, config = {}) => {
    const network = new Network({ layers: [2, 0, 10, 0, 1], ...config })
    for (let i = 0; i < 80000; i++) {
        const item = data[Math.floor(Math.random() * data.length)]
        network.train(item.input, item.output)
    }

    let encode = network.encode()
    const newNetwork = new Network(encode)

    const test = data.every(d => {
        const r = newNetwork.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

const test = (...args) => {
    const name = args[0]
    const result = args[1] ? "OK" : "FAIL"
    console.log(`Test "${name}": ${result}`)
    tests.push({ TEST: name, RESULT: result })
}

test("XOR sigmoid", testIO(XOR))
test("OR sigmoid", testIO(OR))
test("AND sigmoid", testIO(AND))
test("RAND sigmoid", testIO(RAND))

test("XOR relu", testIO(XOR, { activator: "relu" }))
test("OR relu", testIO(OR, { activator: "relu" }))
test("AND relu", testIO(AND, { activator: "relu" }))
test("RAND relu", testIO(RAND, { activator: "relu" }))

test("XOR tanh", testIO(XOR, { activator: "tanh" }))
test("OR tanh", testIO(OR, { activator: "tanh" }))
test("AND tanh", testIO(AND, { activator: "tanh" }))
test("RAND tanh", testIO(RAND, { activator: "tanh" }))

test("XOR mixed", testIO(XOR, { layers: [2, { neurons: 10, activator: "relu" }, { neurons: 10, activator: "tanh" }, 1] }))
test("OR mixed", testIO(OR, { layers: [2, { neurons: 10, activator: "relu" }, { neurons: 10, activator: "tanh" }, 1] }))
test("AND mixed", testIO(AND, { layers: [2, { neurons: 10, activator: "relu" }, { neurons: 10, activator: "tanh" }, 1] }))
test("RAND mixed", testIO(RAND, { layers: [2, { neurons: 10, activator: "relu" }, { neurons: 10, activator: "tanh" }, 1] }))

test("XOR encode/decode", testEncodeDecode(XOR, { layers: [2, 0, { neurons: 4, activator: "sigmoid" }, 0, { neurons: 4, activator: "relu" }, 1] }))
test("OR encode/decode", testEncodeDecode(OR, { layers: [2, 0, { neurons: 4, activator: "sigmoid" }, 0, { neurons: 4, activator: "relu" }, 1] }))
test("AND encode/decode", testEncodeDecode(AND, { layers: [2, 0, { neurons: 4, activator: "sigmoid" }, 0, { neurons: 4, activator: "relu" }, 1] }))
test("RAND encode/decode", testEncodeDecode(RAND, { layers: [2, 0, { neurons: 4, activator: "sigmoid" }, 0, { neurons: 4, activator: "relu" }, 1] }))

console.table(tests)
