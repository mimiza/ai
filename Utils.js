export const uid = () => {
    return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
}

export const random = (...input) => {
    if (Array.isArray(input[0])) return input[0][Math.floor(Math.random() * input[0].length)]
    if (input.length === 2 && input.every(i => typeof i === "number")) {
        const min = Math.min(...input)
        const max = Math.max(...input)
        if (min === max) return min
        return Math.round(Math.random() * (max - min)) + min
    }
}

export const rearrange = (...inputs) => {
    const sum = inputs.reduce((value, item) => value + item, 0)
    const target = sum / inputs.length
    return inputs.map(value => value + (target - value) * 0.75)
}

export default { uid, random, rearrange }
