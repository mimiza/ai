import http from "http"
import fs from "fs"
import path from "path"

const port = 3000

http.createServer(function (request, response) {
    console.log("REQUEST", request.url)
    const file = "." + request.url
    const ext = String(path.extname(file)).toLowerCase()
    const types = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".wav": "audio/wav",
        ".mp4": "video/mp4",
        ".woff": "application/font-woff",
        ".ttf": "application/font-ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".otf": "application/font-otf",
        ".wasm": "application/wasm"
    }
    const type = types[ext] || "application/octet-stream"
    fs.readFile(file, (error, content) => {
        if (!error) {
            response.writeHead(200, { "Content-Type": type })
            response.end(content, "utf-8")
        }
    })
}).listen(port)

console.log(`Server running at http://127.0.0.1:${port}/`)
