export const uid = () => {
    return Date.now().toString(36) + Math.floor(Math.random() * 999999999).toString(36)
}

export const random = (min, max) => {
    min = min || -5
    max = max || 5
    return Math.floor(Math.random() * (max - min)) - Math.abs(min)
}

export default { uid, random }
