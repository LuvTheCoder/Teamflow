const AppError = require("../utils/AppError");
const teamService = require("./teamService");
const projectService = require("./projectService");

// Team chat: you must be a member of the team
async function requireTeamChatAccess(teamId, userId) {
  await teamService.requireMembership(teamId, userId);
}

// Project chat: you must be a member of the project itself
async function requireProjectChatAccess(projectId, userId) {
  const project = await projectService.findProjectById(projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const membership = await projectService.getProjectMembership(projectId, userId);
  if (!membership) {
    throw new AppError("Only project members can use the project chat", 403);
  }

  return project;
}

module.exports = { requireTeamChatAccess, requireProjectChatAccess };