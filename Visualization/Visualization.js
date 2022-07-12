import Network from "../Network.js"

const XOR = [
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] }
]

const network = new Network({ layers: [2, 0, 1] })

const xmlns = "http://www.w3.org/2000/svg"

const svg = document.querySelector("#visualization")

const draw = (name, attributes) => {
    const element = document.createElementNS(xmlns, name)
    for (const key in attributes) element.setAttribute(key, attributes[key])
    svg.appendChild(element)
}

const present = (data = {}) => {
    const w = svg.width.baseVal.value
    const h = svg.height.baseVal.value
    const lw = w / data.l.length // Layer width.
    const map = {}
    data.l.forEach((layer, lindex) => {
        const neurons = layer.n || layer
        neurons.forEach((neuron, nindex) => {
            const rh = h / neurons.length // Row height.
            const r = lw * 0.2 // Neuron radius.
            const x = lw * lindex + lw / 2
            const y = rh * nindex + rh / 2
            draw("circle", { cx: x, cy: y, r, fill: "none", stroke: "red", "stroke-width": 2 })
            map[neuron] = { x, y, r }
        })
    })
    data.c.forEach(connection => {
        const x1 = map[connection["<"]].x + map[connection["<"]].r
        const y1 = map[connection["<"]].y
        const x2 = map[connection[">"]].x - map[connection[">"]].r
        const y2 = map[connection[">"]].y
        draw("path", { d: `M ${x1} ${y1} L ${x2} ${y2}`, fill: "none", stroke: "red", "stroke-width": 2 })
    })
}

const visualize = () => {
    const topology = network.encode()
    present(topology)

    const test = XOR.map(d => network.calculate(d.input)[0])
    console.log(test)

    network.mutate()
    setTimeout(() => {
        // while (svg.lastChild) svg.removeChild(svg.lastChild)
        svg.innerHTML = ""
        visualize()
    }, 1000)
}

visualize()
