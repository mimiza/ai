import Network from "./Network.js"

const data = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

const network = new Network({ layers: [2, 10, 10, 1] })

for (let i = 0; i < 20000; i++) data.forEach(d => network.train(d.input, d.output))

for (let i = 0; i < 50; i++)
    data.forEach(d => {
        const test = network.calculate(d.input)
        console.log({ input: d.input, output: Math.round(test[0]), check: Math.round(test[0]) === d.output[0] })
    })
