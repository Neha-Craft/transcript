const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/socket.io/",
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start_transcription", () => {
    console.log("Start transcription");
  });

  socket.on("audio_chunk", (data) => {
    // Decode and process
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});



