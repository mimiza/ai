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
    const r = lw * 0.2 // Neuron radius.
    const map = {}
    data.l.forEach((layer, lindex) => {
        const neurons = layer.n || layer
        neurons.forEach((neuron, nindex) => {
            const rh = h / neurons.length // Row height.
            const x = lw * lindex + lw / 2
            const y = rh * nindex + rh / 2
            draw("circle", { cx: x, cy: y, r, fill: "none", stroke: "black", "stroke-width": 4 })
            map[neuron] = { x, y, r }
        })
    })
    data.c.forEach(connection => {
        if (!connection || !data.n[connection["<"]].s || !data.n[connection[">"]].s) return
        const curve = r * 3
        const x1 = map[connection["<"]].x + map[connection["<"]].r
        const y1 = map[connection["<"]].y
        const x2 = map[connection[">"]].x - map[connection[">"]].r
        const y2 = map[connection[">"]].y
        const cx1 = x1 + curve
        const cy1 = x1 >= x2 && y1 === y2 ? y1 - curve : y1
        const cx2 = x2 - curve
        const cy2 = x1 >= x2 && y1 === y2 ? y2 - curve : y2
        draw("path", { d: `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`, fill: "none", stroke: x1 < x2 ? "blue" : "green", "stroke-width": 2 })
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
    }, 10)
}

visualize()
