const players = new Map();

export function addPlayer(playerId, roomCode, username) {

    players.set(playerId, {
        id: playerId,
        roomCode: roomCode,
        username: username,
        x: 720,
        y: 480,
        direction: "down"
    });

    return true;
}

export function getPlayer(playerId) {
    return players.get(playerId);
}

export function getPlayersInRoom(roomCode) {
    return [...players.values()].filter(
        (player) => player.roomCode === roomCode
    );
}

export function removePlayer(playerId) {
    players.delete(playerId);
}