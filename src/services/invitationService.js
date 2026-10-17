const supabase = require("../config/supabase");

async function createInvitation(teamId, email, invitedBy){
    const {data, error} = await supabase
                .from("team_invitations")
                .insert({team_id : teamId, email, invited_by: invitedBy})
                .select()
                .single();

    if(error) throw error;
    return data;
}


// Is there already a PENDING invitation for this email in this team?
async function findPendingInvitation(teamId, email){
    const {data, error} = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .eq("email", email)
        .eq("status", "PENDING")
        .maybeSingle();

    if(error) throw error;
    return data;
}

async function getPendingInvitationsForEmail(email){
    const {data, error} = await supabase
        .from("team_invitations")
        .select("id, status, created_at, team:teams(id, name), inviter:users(name, email)")
        .eq("email", email)
        .eq("status", "PENDING")

        if(error) throw error;

        return data;
}

async function findInvitationById(id){
    const {data, error} = await supabase
        .from("team_invitations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if(error) throw error;
    return data;
}

async function setInvitationStatus(id, status){
    const {error} = await supabase
        .from("team_invitations")
        .update({status})
        .eq("id", id);


    if(error) throw error;
}

module.exports = {
  createInvitation,
  findPendingInvitation,
  getPendingInvitationsForEmail,
  findInvitationById,
  setInvitationStatus,
};