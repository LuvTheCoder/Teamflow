const { z } = require("zod");

const AppError = require("../utils/AppError");
const validate = require("../utils/validate");
const projectService = require("../services/projectService");
const taskService = require("../services/taskService");
const { loadProjectForUser } = require("./projectController");

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];


const projectParamsSchema = z.object({
  projectId: z.string().uuid("must be a valid id"),
});

const taskParamsSchema = z.object({
  taskId: z.string().uuid("must be a valid id"),
});

// Date must look like 2026-12-31
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be in YYYY-MM-DD format");

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "must be at least 2 characters"),
  description: z.string().trim().optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(STATUSES).optional(),
  dueDate: dateSchema.nullable().optional(),
  assignedTo: z.string().uuid("must be a valid id").nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(2, "must be at least 2 characters").optional(),
  description: z.string().trim().nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: dateSchema.nullable().optional(),
  assignedTo: z.string().uuid("must be a valid id").nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(STATUSES),
});

// A task can only be assigned to someone who is in the project
async function checkAssignee(projectId, assignedTo) {
  if (!assignedTo) return;

  const membership = await projectService.getProjectMembership(projectId, assignedTo);
  if (!membership) {
    throw new AppError("You can only assign a task to a project member", 400);
  }
}

// Loads a task and checks the user may access its project
async function loadTaskForUser(taskId, userId) {
  const task = await taskService.findTaskById(taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const { project, teamMembership } = await loadProjectForUser(task.project_id, userId);
  return { task, project, teamMembership };
}

// POST /api/projects/:projectId/tasks
async function createTask(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  const body = validate(createTaskSchema, req.body);

  await loadProjectForUser(projectId, req.user.id);
  await checkAssignee(projectId, body.assignedTo);

  const task = await taskService.createTask({
    project_id: projectId,
    title: body.title,
    description: body.description,
    priority: body.priority,
    status: body.status,
    due_date: body.dueDate,
    assigned_to: body.assignedTo,
    created_by: req.user.id,
  });

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    data: { task },
  });
}

// GET /api/projects/:projectId/tasks
async function getProjectTasks(req, res) {
  const { projectId } = validate(projectParamsSchema, req.params);
  await loadProjectForUser(projectId, req.user.id);

  const tasks = await taskService.getProjectTasks(projectId);

  // Group tasks into Kanban columns
  const board = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
  for (const task of tasks) {
    board[task.status].push(task);
  }

  res.status(200).json({
    status: "success",
    data: { tasks, board },
  });
}

// PATCH /api/tasks/:taskId
async function updateTask(req, res) {
  const { taskId } = validate(taskParamsSchema, req.params);
  const body = validate(updateTaskSchema, req.body);

  const { task } = await loadTaskForUser(taskId, req.user.id);

  // Only update the fields the client actually sent
  const changes = {};
  if (body.title !== undefined) changes.title = body.title;
  if (body.description !== undefined) changes.description = body.description;
  if (body.priority !== undefined) changes.priority = body.priority;
  if (body.dueDate !== undefined) changes.due_date = body.dueDate;
  if (body.assignedTo !== undefined) {
    await checkAssignee(task.project_id, body.assignedTo);
    changes.assigned_to = body.assignedTo;
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError("Send at least one field to update", 400);
  }

  const updated = await taskService.updateTask(taskId, changes);

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: { task: updated },
  });
}

// PATCH /api/tasks/:taskId/status   (moving a card on the Kanban board)
async function updateTaskStatus(req, res) {
  const { taskId } = validate(taskParamsSchema, req.params);
  const { status } = validate(statusSchema, req.body);

  await loadTaskForUser(taskId, req.user.id);

  const updated = await taskService.updateTask(taskId, { status });

  res.status(200).json({
    status: "success",
    message: "Task status updated",
    data: { task: updated },
  });
}

// DELETE /api/tasks/:taskId
async function deleteTask(req, res) {
  const { taskId } = validate(taskParamsSchema, req.params);
  const { task, teamMembership } = await loadTaskForUser(taskId, req.user.id);

  const canDelete = teamMembership.role === "OWNER" || task.created_by === req.user.id;
  if (!canDelete) {
    throw new AppError("Only the team owner or task creator can delete this task", 403);
  }

  await taskService.deleteTask(taskId);

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
}

module.exports = { createTask, getProjectTasks, updateTask, updateTaskStatus, deleteTask };