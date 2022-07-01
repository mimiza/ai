import Network from "../Network.js"

const network = new Network({ layers: [2, 0, 1] })
console.log("BEFORE ENCODE", network.encode())
network.encode()
console.log("AFTER ENCODE", network.encode())
