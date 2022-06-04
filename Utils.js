const sigmoid = (x = 0) => {
    return 1 / (1 + Math.exp(-x))
}

const ReLU = (x = 0) => {
    return Math.max(0, x)
}

const uid = () => {
    return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
}

export default { sigmoid, ReLU, uid }
