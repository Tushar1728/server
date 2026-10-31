import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createRoom, roomExists, deleteRoom } from "./rooms/roomManager.js";
import {
    addPlayer,
    getPlayer,
    getPlayersInRoom,
    removePlayer
} from "./players/playerManager.js";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("player-move", (data) => {
        const player = getPlayer(socket.id);

        if (!player) {
            return;
        }

        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;

        socket.to(player.roomCode).emit("player-moved", {
            playerId: socket.id,
            x: player.x,
            y: player.y,
            moving: data.moving,
            direction: data.direction
        });
    });

    socket.on("disconnect", () => {
        const player = getPlayer(socket.id);

        if (!player) {
            console.log("Player disconnected:", socket.id);
            return;
        }

        const roomCode = player.roomCode;

        removePlayer(socket.id);

        socket.to(roomCode).emit("player-disconnected", {
            playerId: socket.id
        });

        const playersInRoom = getPlayersInRoom(roomCode);

        if (playersInRoom.length === 0) {
            deleteRoom(roomCode);
            console.log(`Room ${roomCode} deleted because it is empty`);
        }

        console.log(`${socket.id} left room ${roomCode}`);
    });

    socket.on("create-room", (playerName, callback) => {
        const roomCode = createRoom();

        socket.join(roomCode);

        addPlayer(socket.id, roomCode, playerName);

        callback({
            success: true,
            roomCode,
            player: getPlayer(socket.id)
        });

        console.log(`${socket.id} created room ${roomCode}`);
    });

    socket.on("join-room", (roomCode, playerName, callback) => {
        if (!roomExists(roomCode)) {
            callback({
                success: false,
                message: "Room does not exist"
            });
            return;
        }

        const existingPlayers = getPlayersInRoom(roomCode);

        socket.join(roomCode);

        addPlayer(socket.id, roomCode, playerName);

        const player = getPlayer(socket.id);

        socket.to(roomCode).emit("player-joined", {
            player: player
        });

        callback({
            success: true,
            roomCode,
            existingPlayers,
            player
        });

        console.log(`${socket.id} joined room ${roomCode}`);
    });
});

httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
});