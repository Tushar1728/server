const rooms = new Set();

export function createRoom() {
    let code;

    do {
        code = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    } while (rooms.has(code));

    rooms.add(code);

    return code;
}

export function roomExists(code) {
    return rooms.has(code);
}