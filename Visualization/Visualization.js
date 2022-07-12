import Network from "../Network.js"

const network = new Network({ layers: [2, 4, 4, 2] }).encode()

const xmlns = "http://www.w3.org/2000/svg"

const svg = document.querySelector("#visualization")

const draw = (name, attributes) => {
    const element = document.createElementNS(xmlns, name)
    for (const key in attributes) element.setAttribute(key, attributes[key])
    svg.appendChild(element)
}

const present = (topology = {}) => {
    const width = svg.width.baseVal.value
    const height = svg.height.baseVal.value
    const layers = topology.l.map((layer, index) =>
        Object.create({
            // x: (width / topology.l.length) * index,
            x: 0,
            // width: width / topology.l.length,
            width: 10,
            // height,
            height: 10,
            stroke: 1
        })
    )
    layers.map(layer => draw("rect", layer))
}

present(network)
