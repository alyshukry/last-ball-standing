export function send(socket, data) {
    socket.send(JSON.stringify(data))
}

export function parse(data) {
    return JSON.parse(data.toString())
}