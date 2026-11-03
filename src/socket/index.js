const { Server } = require("socket.io");
const { z } = require("zod");

const env = require("../config/env");
const validate = require("../utils/validate");
const { verifyToken } = require("../utils/jwt");
const authService = require("../services/authService");
const chatAccess = require("../services/chatAccessService");

let io = null;

function getRoomName(type, id) {
  return `${type}:${id}`;
}

function getBearerToken(header) {
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }
  return null;
}

function reply(ack, data) {
  if (typeof ack === "function") {
    ack(data);
  }
}

const roomSchema = z.object({
  type: z.enum(["team", "project"]),
  id: z.string().uuid("must be a valid id"),
});

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl },
  });

  // Runs once for every new connection. Rejects people who are not logged in
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || getBearerToken(socket.handshake.headers.authorization);

      if (!token) {
        return next(new Error("Please log in to continue"));
      }

      const payload = verifyToken(token);
      const user = await authService.findUserById(payload.userId);

      if (!user) {
        return next(new Error("User no longer exists"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Client asks: "let me into this chat"
    socket.on("join_chat", async (payload, ack) => {
      try {
        const { type, id } = validate(roomSchema, payload);

        if (type === "team") {
          await chatAccess.requireTeamChatAccess(id, socket.user.id);
        } else {
          await chatAccess.requireProjectChatAccess(id, socket.user.id);
        }

        const room = getRoomName(type, id);
        socket.join(room);
        reply(ack, { ok: true, room });
      } catch (error) {
        const message = error.statusCode ? error.message : "Could not join the chat";
        reply(ack, { ok: false, message });
      }
    });

    // Client asks: "I closed this chat"
    socket.on("leave_chat", (payload, ack) => {
      const result = roomSchema.safeParse(payload);

      if (result.success) {
        socket.leave(getRoomName(result.data.type, result.data.id));
      }

      reply(ack, { ok: true });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
}

// Sends a saved message to everyone who joined that chat's room
function broadcastMessage(message) {
  if (!io) return;

  const room = message.team_id
    ? getRoomName("team", message.team_id)
    : getRoomName("project", message.project_id);

  io.to(room).emit("new_message", message);
}

module.exports = { initSocket, broadcastMessage };