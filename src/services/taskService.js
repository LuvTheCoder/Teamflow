const supabase = require("../config/supabase");

const TASK_COLUMNS = "*, assignee:users!assigned_to(id, name, email)";

async function createTask(data) {
  const { data: task, error } = await supabase
    .from("tasks")
    .insert(data)
    .select(TASK_COLUMNS)
    .single();

  if (error) throw error;
  return task;
}

async function getProjectTasks(projectId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

async function findTaskById(taskId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function updateTask(taskId, changes) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select(TASK_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw error;
}

module.exports = {
  createTask,
  getProjectTasks,
  findTaskById,
  updateTask,
  deleteTask,
}