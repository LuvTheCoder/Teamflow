const supabase = require("../config/supabase")
const AppError = require("../utils/AppError")


// Create a team and add the creator as OWNER
async function createTeam(name, description, ownerId){
    const{data : team, error} = await supabase
    .from("teams")
    .insert({name, description, owner_id:ownerId})
    .select()
    .single()

    if(error){
        throw error;
    }

    const{error: memberError} = await supabase
                    .from("team_members")
                    .insert({
                        team_id: team.id,
                        user_id: ownerId,
                        role: "OWNER"
                    })
    
    if(memberError) throw memberError;

    return team;
}

// All teams the user belongs to (with the user's role in each)
async function getUserTeams(userId){
    const {data, error} = await supabase
            .from("team_members")
            .select("role, teams(id, name, description, owner_id, created_at)")
            .eq("user_id", userId);
    if (error) throw error;

    return data.map((row)=>({...row.teams, role:row.role}))
}


//Returns the membership row, or null id the user not in team
async function getMembership(teamId, userId){
    const {data, error} = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

    if(error) throw error;

    return data;
}

// Throws a 403 error if the user is not in the team. Returns the membership
async function requireMembership(teamId, userId){
    const membership = await getMembership(teamId, userId);
    if(!membership){
        throw new AppError("You are not member of this team.", 403);
    }

    return membership;
}

//Get all members of the team
async function getTeamMembers(teamId){
    const {data, error} = await supabase
        .from("team_members")
        .select("role, joined_at, users(id, name, email)")
        .eq("team_id", teamId);

    if(error) throw error;

    return data.map((row)=>({
        id: row.users.id,
        name: row.users.name,
        email: row.users.email,
        role: row.role,
        joinedAt: row.joined_at
    }))
}


//Add a user to a team as MEMBER
async function addMember(teamId, userId){
    const {error} = await supabase
        .from("team_members")
        .insert({team_id : teamId, user_id :userId, role:"MEMBER"})
    
    if(error){
        throw error;
    }
}

module.exports = {
  createTeam,
  getUserTeams,
  getMembership,
  requireMembership,
  getTeamMembers,
  addMember,
};




