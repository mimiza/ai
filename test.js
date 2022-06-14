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
    for (let i = 0; i < 5000; i++) data.forEach(d => network.train(d.input, d.output))

    // data.forEach(d => {
    //     const r = network.calculate(d.input)
    //     results.push({ i: d.input, e: d.output, o: r.map(Math.round), a: r.map(Math.round)[0] === d.output[0] })
    // })

    const test = data.every(d => {
        const r = network.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

const testBackupRestore = (data, config = {}) => {
    const results = []
    const network = new Network({ layers: [2, 10, 1], ...config })
    for (let i = 0; i < 5000; i++) data.forEach(d => network.train(d.input, d.output))

    let backup = JSON.stringify(network.structure(), null, 2)
    const newNetwork = new Network()
    newNetwork.restore(backup)

    // data.forEach(d => {
    //     const r = newNetwork.calculate(d.input)
    //     results.push({ i: d.input, e: d.output, o: r.map(Math.round), a: r.map(Math.round)[0] === d.output[0] })
    // })

    const test = data.every(d => {
        const r = newNetwork.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

console.log("XOR Sigmoid", testNetwork(XOR))
console.log("OR Sigmoid", testNetwork(OR))
console.log("AND Sigmoid", testNetwork(AND))
console.log("RAND Sigmoid", testNetwork(RAND))

console.log("XOR ReLU", testNetwork(XOR, { a: "ReLU" }))
console.log("OR ReLU", testNetwork(OR, { a: "ReLU" }))
console.log("AND ReLU", testNetwork(AND, { a: "ReLU" }))
console.log("RAND ReLU", testNetwork(RAND, { a: "ReLU" }))

console.log("XOR MixedActivator", testNetwork(XOR, { layers: [2, { neurons: 10, activator: "ReLU" }, 1] }))
console.log("OR MixedActivator", testNetwork(OR, { layers: [2, { neurons: 10, activator: "ReLU" }, 1] }))
console.log("AND MixedActivator", testNetwork(AND, { layers: [2, { neurons: 10, activator: "ReLU" }, 1] }))
console.log("RAND MixedActivator", testNetwork(RAND, { layers: [2, { neurons: 10, activator: "ReLU" }, 1] }))

console.log("XOR Backup/Restore", testBackupRestore(XOR))
console.log("OR Backup/Restore", testBackupRestore(OR))
console.log("AND Backup/Restore", testBackupRestore(AND))
console.log("RAND Backup/Restore", testBackupRestore(RAND))
