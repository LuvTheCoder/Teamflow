const supabase = require("../config/supabase");

// sender:users!sender_id(...) returns the sender's name with every message
const MESSAGE_COLUMNS =
  "id, team_id, project_id, content, created_at, sender:users!sender_id(id, name)";

// Save a message. Pass teamId OR projectId
async function createMessage({ teamId, projectId, senderId, content }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      team_id: teamId || null,
      project_id: projectId || null,
      sender_id: senderId,
      content,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// field is "team_id" or "project_id". Returns the newest messages, oldest first
async function getMessages(field, id, limit, before) {
  let query = supabase
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .eq(field, id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // "before" is used to load older messages
  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.reverse();
}

module.exports = { createMessage, getMessages };
