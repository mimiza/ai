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

const testNetwork = (data, config = {}) => {
    const results = []
    const network = new Network({ layers: [2, 10, 1], ...config })
    for (let i = 0; i < 50000; i++) data.forEach(d => network.train(d.input, d.output))

    data.forEach(d => {
        const r = network.calculate(d.input)
        results.push({ i: d.input, e: d.output, o: r.map(Math.round), a: r.map(Math.round)[0] === d.output[0] })
    })

    return results
}

const testReLUSigmoid = (data, config = {}) => {
    const results = []
    const network = new Network({ layers: [2, {neurons: 10, activator: "ReLU"}, 1], ...config })
    for (let i = 0; i < 50000; i++) data.forEach(d => network.train(d.input, d.output))

    data.forEach(d => {
        const r = network.calculate(d.input)
        results.push({ i: d.input, e: d.output, o: r.map(Math.round), a: r.map(Math.round)[0] === d.output[0] })
    })
    
    let backup = JSON.stringify(network.structure(), null, 2)
    console.log(backup)

    return results
}

const testBackupRestore = data => {
    const results = []
    const network = new Network({ layers: [2, 10, 1] })
    for (let i = 0; i < 50000; i++) data.forEach(d => network.train(d.input, d.output))

    let backup = JSON.stringify(network.structure(), null, 2)
    const newNetwork = new Network()
    newNetwork.restore(backup)

    data.forEach(d => {
        const r = newNetwork.calculate(d.input)
        results.push({ i: d.input, e: d.output, o: r.map(Math.round), a: r.map(Math.round)[0] === d.output[0] })
    })

    return results
}

console.log("TEST XOR sigmoid", testNetwork(XOR))
console.log("TEST OR sigmoid", testNetwork(OR))
console.log("TEST AND sigmoid", testNetwork(AND))
console.log("TEST RAND sigmoid", testNetwork(RAND))

console.log("TEST XOR ReLUSigmoid", testReLUSigmoid(XOR))
console.log("TEST OR ReLUSigmoid", testReLUSigmoid(OR))
console.log("TEST AND ReLUSigmoid", testReLUSigmoid(AND))
console.log("TEST RAND ReLUSigmoid", testReLUSigmoid(RAND))

console.log("TEST XOR ReLU", testNetwork(XOR, { a: "ReLU", r: 0.01, m: 0.01 }))
console.log("TEST OR ReLU", testNetwork(OR, { a: "ReLU", r: 0.01, m: 0.01 }))
console.log("TEST AND ReLU", testNetwork(AND, { a: "ReLU", r: 0.01, m: 0.01 }))
console.log("TEST RAND ReLU", testNetwork(RAND, { a: "ReLU", r: 0.01, m: 0.01 }))

console.log("TEST BACKUP RESTORE XOR", testBackupRestore(XOR))
console.log("TEST BACKUP RESTORE OR", testBackupRestore(OR))
console.log("TEST BACKUP RESTORE AND", testBackupRestore(AND))
console.log("TEST BACKUP RESTORE RAND", testBackupRestore(RAND))
