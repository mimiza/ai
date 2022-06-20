import Network from "../Network.js"

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

const testEncodeDecode = (data, config = {}) => {
    const network = new Network({ layers: [2, 2, 1], ...config })
    // for (let i = 0; i < 20000; i++) data.forEach(d => network.train(d.input, d.output))

    let encode = JSON.stringify(network.encode(), null, 2)

    const newNetwork = new Network(encode)
    let encode2 = JSON.stringify(newNetwork.encode(), null, 2)
    console.log(encode, encode2, encode === encode2)
    process.exit()

    const test = data.every(d => {
        const r = newNetwork.calculate(d.input)
        return r.map(Math.round)[0] === d.output[0]
    })

    return test
}

const test = (...args) => console.log("TEST:", args[0], "-", args[1] ? "OK" : "FAIL")

test("XOR encode/decode", testEncodeDecode(XOR))
