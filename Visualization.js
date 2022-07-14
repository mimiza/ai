export class Visualization {
    constructor(config) {
        this.svg = config.svg
        this.colors = {
            neuron: {
                fill: config?.colors?.neuron?.fill || "#ffffff",
                stroke: config?.colors?.neuron?.stroke || "#444444"
            },
            connection: {
                forward: config?.colors?.connection?.forward || "#2772db",
                recursive: config?.colors?.connection?.recursive || "#7dd87d"
            },
            text: {
                bias: config?.colors?.text?.bias || "#444444",
                weight: config?.colors?.text?.weight || "#d64161"
            }
        }
        this.xmlns = "http://www.w3.org/2000/svg"
    }

    draw = (name, attributes = {}, parent) => {
        parent = parent || this.svg
        const element = document.createElementNS(this.xmlns, name)
        for (const key in attributes) element.setAttribute(key, attributes[key])
        parent.appendChild(element)
        return element
    }

    clear() {
        this.svg.innerHTML = ""
    }

    present = (data = {}) => {
        this.clear()
        const w = this.svg.width.baseVal.value
        const h = this.svg.height.baseVal.value
        const lw = w / data.l.length // Layer width.
        const r = lw * 0.1 // Neuron radius.
        const text = r / 3
        const map = {}
        data.l.forEach((layer, lindex) => {
            const neurons = layer.n || layer
            neurons.forEach((neuron, nindex) => {
                const rh = h / neurons.length // Row height.
                const x = lw * lindex + lw / 2
                const y = rh * nindex + rh / 2
                map[neuron["#"]] = { x, y }
            })
        })
        data.n.forEach(neuron => {
            if (!neuron.s) return
            const { x, y } = map[neuron["#"]]
            // Group elements.
            const group = this.draw("g")
            // Draw neuron.
            this.draw("circle", { cx: x, cy: y, r, fill: this.colors.neuron.fill, stroke: this.colors.neuron.stroke, "stroke-width": 2 }, group)
            // Draw neuron bias.
            this.draw("text", { x, y, fill: this.colors.text.bias, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": text }, group).textContent = parseFloat(neuron.b.toFixed(2))
            // Draw output connections.
            neuron[">"].forEach(connection => {
                const from = !isNaN(connection["<"]["#"]) ? connection["<"]["#"] : connection["<"] || neuron["#"]
                const to = !isNaN(connection[">"]["#"]) ? connection[">"]["#"] : connection[">"]
                if (!connection.s || !data.n[from].s || !data.n[to].s) return
                const id = `connection-${from}-${to}`
                const curve = r * 3
                const x1 = map[from].x + r
                const y1 = map[from].y
                const x2 = map[to].x - r
                const y2 = map[to].y
                const cx1 = x1 + curve
                const cy1 = x1 >= x2 && y1 === y2 ? y1 - curve : y1
                const cx2 = x2 - curve
                const cy2 = x1 >= x2 && y1 === y2 ? y2 - curve : y2
                const transform = x1 > x2 ? "scale(+1,-1)" : ""
                // Draw connection.
                this.draw("path", { id, class: "connection", d: `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`, fill: "none", stroke: x1 < x2 ? this.colors.connection.forward : this.colors.connection.recursive, "stroke-width": 2 }, group)
                // Draw connection weight.
                this.draw("textPath", { class: "weight", href: "#" + id, transform, fill: this.colors.text.weight, startOffset: curve, "font-size": text }, this.draw("text", {}, group)).textContent = parseFloat(connection.w.toFixed(5))
            })
        })
    }
}

export default Visualization
