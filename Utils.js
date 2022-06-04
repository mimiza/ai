export const sigmoid = (x = 0) => {
    return 1 / (1 + Math.exp(-x))
}

export const ReLU = (x = 0) => {
    return Math.max(0, x)
}

export const uid = () => {
    return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
}

export const random = (min, max) => {
    min = min || -5
    max = max || 5
    return Math.floor(Math.random() * (max - min)) - Math.abs(min)
}

export default { sigmoid, ReLU, uid, random }
