export const uid = () => {
    return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
}

export const random = (...input) => {
    if (Array.isArray(input[0])) return input[0][Math.floor(Math.random() * input[0].length)]
    if (input.length === 2 && input.every(i => typeof i === "number") && input[0] < input[1]) {
        const min = input[0]
        const max = input[1]
        return Math.round(Math.random() * (max - min)) - Math.abs(min)
    }
}

export default { uid, random }
