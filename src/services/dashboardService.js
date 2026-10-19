const supabase = require("../config/supabase");
const teamService = require("./teamService");
const projectService = require("./projectService");

// All projects the user can see, across all their teams
async function getVisibleProjects(userId) {
  const teams = await teamService.getUserTeams(userId);

  const lists = await Promise.all(
    teams.map(async (team) => {
      const projects = await projectService.getTeamProjects(team.id, userId, team.role);
      return projects.map((project) => ({ ...project, team_name: team.name }));
    })
  );

  return lists.flat();
}

// Only the columns we need to count tasks
async function getTasksForProjects(projectIds) {
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("id, project_id, status")
    .in("project_id", projectIds);

  if (error) throw error;
  return data;
}


module.exports = { getVisibleProjects, getTasksForProjects };