const dashboardService = require("../services/dashboardService");

// Percentage of tasks that are DONE (0 if there are no tasks)
function calculateProgress(done, total) {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

// GET /api/dashboard
async function getDashboard(req, res) {
  const projects = await dashboardService.getVisibleProjects(req.user.id);
  const projectIds = projects.map((project) => project.id);
  const tasks = await dashboardService.getTasksForProjects(projectIds);

  // Count tasks per status
  const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
  for (const task of tasks) {
    tasksByStatus[task.status] += 1;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.DONE;
  const pendingTasks = totalTasks - completedTasks;

  // Progress for each project
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project_id === project.id);
    const done = projectTasks.filter((task) => task.status === "DONE").length;

    return {
      id: project.id,
      name: project.name,
      teamName: project.team_name,
      totalTasks: projectTasks.length,
      completedTasks: done,
      progress: calculateProgress(done, projectTasks.length),
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      overallProgress: calculateProgress(completedTasks, totalTasks),
      tasksByStatus,
      projects: projectProgress,
    },
  });
}

module.exports = { getDashboard };