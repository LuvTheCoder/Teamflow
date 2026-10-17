const { z } = require("zod");

const AppError = require("../utils/AppError");
const validate = require("../utils/validate");
const teamService = require("../services/teamService");
const projectService = require("../services/projectService");

const teamParamsSchema = z.object({
  teamId: z.string().uuid("must be a valid id"),
});

const projectParamsSchema = z.object({
  projectId: z.string().uuid("must be a valid id"),
});

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "must be at least 2 characters"),
  description: z.string().trim().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid("must be a valid id"),
});

// Loads a project and checks the user may access it.
// Returns { project, teamMembership, isProjectMember }
async function loadProjectForUser(projectId, userId) {
  const project = await projectService.findProjectById(projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const teamMembership = await teamService.requireMembership(project.team_id, userId);
  const projectMembership = await projectService.getProjectMembership(projectId, userId);
  const isProjectMember = Boolean(projectMembership);

  // Team owners can see everything. Others must be project members
  if (teamMembership.role !== "OWNER" && !isProjectMember) {
    throw new AppError("You are not a member of this project", 403);
  }

  return { project, teamMembership, isProjectMember };
}

// POST /api/teams/:teamId/projects
async function createProject(req, res) {
  const { teamId } = validate(teamParamsSchema, req.params);
  const { name, description } = validate(createProjectSchema, req.body);

  await teamService.requireMembership(teamId, req.user.id);

  const project = await projectService.createProject(teamId, name, description, req.user.id);

  res.status(201).json({
    status: "success",
    message: "Project created successfully",
    data: { project },
  });
}

// GET /api/teams/:teamId/projects
async function getTeamProjects(req, res) {
  const { teamId } = validate(teamParamsSchema, req.params);

  const membership = await teamService.requireMembership(teamId, req.user.id);
  const projects = await projectService.getTeamProjects(teamId, req.user.id, membership.role);

  res.status(200).json({
    status: "success",
    data: { projects },
  });
}

// GET /api/projects/:projectId
async function getProject(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  const { project } = await loadProjectForUser(projectId, req.user.id);

  res.status(200).json({
    status: "success",
    data: { project },
  });
}

// GET /api/projects/:projectId/members
async function getProjectMembers(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  await loadProjectForUser(projectId, req.user.id);

  const members = await projectService.getProjectMembers(projectId);

  res.status(200).json({
    status: "success",
    data: { members },
  });
}

// POST /api/projects/:projectId/members   body: { "userId": "..." }
async function addProjectMember(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  const { userId } = validate(addMemberSchema, req.body);

  const { project, teamMembership } = await loadProjectForUser(projectId, req.user.id);

  // Only the team owner or the project creator can add people
  const canAdd = teamMembership.role === "OWNER" || project.created_by === req.user.id;
  if (!canAdd) {
    throw new AppError("Only the team owner or project creator can add members", 403);
  }

  // The person must already be in the team
  const userInTeam = await teamService.getMembership(project.team_id, userId);
  if (!userInTeam) {
    throw new AppError("This user is not a member of the team", 400);
  }

  const alreadyInProject = await projectService.getProjectMembership(projectId, userId);
  if (alreadyInProject) {
    throw new AppError("This user is already in the project", 409);
  }

  await projectService.addProjectMember(projectId, userId);

  res.status(201).json({
    status: "success",
    message: "Member added to project",
  });
}

module.exports = {
  createProject,
  getTeamProjects,
  getProject,
  getProjectMembers,
  addProjectMember,
  loadProjectForUser,
};