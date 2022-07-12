import Network from "../Network.js"

const network = new Network({ layers: [2, 4, 4, 2] }).encode()

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
    const map = {}
    data.l.forEach((layer, lindex) => {
        const neurons = layer.n || layer
        neurons.forEach((neuron, nindex) => {
            const lw = w / data.l.length // Layer width.
            const rh = h / neurons.length // Row height.
            const r = lw * 0.2 // Neuron radius.
            const x = lw * lindex + lw / 2
            const y = rh * nindex + rh / 2
            draw("circle", {
                cx: x,
                cy: y,
                r,
                "fill-opacity": 0,
                stroke: "red",
                "stroke-width": 2
            })
            map[neuron["#"]] = { x, y, r }
        })
    })
    data.c.forEach(connection => {
        const x1 = map[connection.from].x + map[connection.from].r
        const y1 = map[connection.from].y
        const x2 = map[connection.to].x - map[connection.to].r
        const y2 = map[connection.to].y
        draw("line", {
            x1,
            y1,
            x2,
            y2,
            stroke: "red",
            "stroke-width": 2
        })
    })
}

present(network)
