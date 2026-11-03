// Usage: node scripts/listen.js <token> <team|project> <id>
const { io } = require("socket.io-client");

const [, , token, type, id] = process.argv;

if (!token || !type || !id) {
  console.log("Usage: node scripts/listen.js <token> <team|project> <id>");
  process.exit(1);
}

const socket = io(process.env.SERVER_URL || "http://localhost:5001", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_chat", { type, id }, (result) => {
    console.log("Join result:", result);
  });
});

socket.on("new_message", (message) => {
  console.log("NEW MESSAGE:", message.sender.name, "->", message.content);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});