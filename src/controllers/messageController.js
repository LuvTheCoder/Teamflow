const { z } = require("zod");

const validate = require("../utils/validate");
const messageService = require("../services/messageService");
const chatAccess = require("../services/chatAccessService");

const teamParamsSchema = z.object({
  teamId: z.string().uuid("must be a valid id"),
});

const projectParamsSchema = z.object({
  projectId: z.string().uuid("must be a valid id"),
});

const sendSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "cannot be empty")
    .max(2000, "must be at most 2000 characters"),
});

// ?limit=50&before=2026-11-03T10:00:00.000Z
const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "must be a valid date")
    .optional(),
});

// GET /api/teams/:teamId/messages
async function getTeamMessages(req, res) {
  const { teamId } = validate(teamParamsSchema, req.params);
  const { limit, before } = validate(listSchema, req.query);

  await chatAccess.requireTeamChatAccess(teamId, req.user.id);
  const messages = await messageService.getMessages("team_id", teamId, limit, before);

  res.status(200).json({ status: "success", data: { messages } });
}

// POST /api/teams/:teamId/messages
async function sendTeamMessage(req, res) {
  const { teamId } = validate(teamParamsSchema, req.params);
  const { content } = validate(sendSchema, req.body);

  await chatAccess.requireTeamChatAccess(teamId, req.user.id);
  const message = await messageService.createMessage({
    teamId,
    senderId: req.user.id,
    content,
  });

  // Part 2: we will also send this message live to everyone in the room here

  res.status(201).json({ status: "success", data: { message } });
}

// GET /api/projects/:projectId/messages
async function getProjectMessages(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  const { limit, before } = validate(listSchema, req.query);

  await chatAccess.requireProjectChatAccess(projectId, req.user.id);
  const messages = await messageService.getMessages("project_id", projectId, limit, before);

  res.status(200).json({ status: "success", data: { messages } });
}

// POST /api/projects/:projectId/messages
async function sendProjectMessage(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  const { content } = validate(sendSchema, req.body);

  await chatAccess.requireProjectChatAccess(projectId, req.user.id);
  const message = await messageService.createMessage({
    projectId,
    senderId: req.user.id,
    content,
  });

  // Part 2: we will also send this message live to everyone in the room here

  res.status(201).json({ status: "success", data: { message } });
}

module.exports = {
  getTeamMessages,
  sendTeamMessage,
  getProjectMessages,
  sendProjectMessage,
};