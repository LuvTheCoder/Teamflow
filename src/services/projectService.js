const supabase = require("../config/supabase");
const AppError = require("../utils/AppError");


// Create a project and add the creator as a project member
async function createProject(teamId, name, description, userId) {
  const { data: project, error } = await supabase
    .from("projects")
    .insert({ team_id: teamId, name, description, created_by: userId })
    .select()
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({ project_id: project.id, user_id: userId });

  if (memberError) throw memberError;

  return project;
}

// Team OWNER sees all projects of the team. A MEMBER sees only projects they are in
async function getTeamProjects(teamId, userId, role) {
  if (role === "OWNER") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("project_members")
    .select("projects!inner(*)")
    .eq("user_id", userId)
    .eq("projects.team_id", teamId);

  if (error) throw error;
  return data.map((row) => row.projects);
}

async function findProjectById(projectId) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getProjectMembership(projectId, userId) {
  const { data, error } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getProjectMembers(projectId) {
  const { data, error } = await supabase
    .from("project_members")
    .select("added_at, users(id, name, email)")
    .eq("project_id", projectId);

  if (error) throw error;

  return data.map((row) => ({
    id: row.users.id,
    name: row.users.name,
    email: row.users.email,
    added_at: row.added_at,
  }));
}

async function addProjectMember(projectId, userId) {
  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: userId });

  if (error) throw error;
}

module.exports = {
  createProject,
  getTeamProjects,
  findProjectById,
  getProjectMembership,
  getProjectMembers,
  addProjectMember,
};