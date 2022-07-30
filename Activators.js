export const sigmoid = (x = 0) => {
    return 1 / (1 + Math.exp(-x))
}

export const relu = (x = 0) => {
    return Math.max(0, x)
}

export const tanh = (x = 0) => {
    return Math.tanh(x)
}

export default { sigmoid, relu, tanh }
