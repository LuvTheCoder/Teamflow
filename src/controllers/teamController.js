const {z} = require("zod")

const AppError = require("../utils/AppError");
const validate = require("../utils/validate");
const teamService = require("../services/teamService");
const invitationService = require("../services/invitationService");
const authService = require("../services/authService");

const createTeamSchema = z.object({
    name : z.string().trim().min(2, "Team name must be at least 2 characters long"),
    description : z.string().trim().optional(),
});

const teamParamsSchema = z.object({
  teamId: z.string().uuid("must be a valid id"),
});

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("must be a valid email"),
});

// POST /api/teams
async function createTeam(req, res){
    const {name, description} = validate(createTeamSchema, req.body);

    const team = await teamService.createTeam(name, description, req.user.id);

    res.status(201).json({
        status : "success",
        message : "Team created successfully",
        data : { team }
    });
}

//GET /api/teams
async function getMyTeams(req, res){
    const teams = await teamService.getUserTeams(req.user.id);

    res.status(200).json({
        status : "success",
        data : {teams},
    });

}

// api/teams/:teamId/members
async function getMembers(req, res){
    const { teamId } = validate(teamParamsSchema, req.params);

    await teamService.requireMembership(teamId, req.user.id);
    const members = await teamService.getTeamMembers(teamId);

    res.status(200).json({
        status : "success",
        data : {members},
    })
}

// POST /api/teams/:teamId/invitations
async function inviteMember(req, res){
    const {teamId} = validate(teamParamsSchema, req.params);
    const {email} = validate(inviteSchema, req.body);

    //Only the tam OWNER can invite
    const membership = await teamService.requireMembership(teamId, req.user.id);
    if(membership.role !== "OWNER"){
        throw new AppError("Only the team owner can invite members.", 403)
    }

    //Is this person already in the team ?
    const invitedUser = await authService.findUserByEmail(email);
    if(!invitedUser){
        throw new AppError("No registered user found with that email.", 404);
    }

    const alreadyMember = await teamService.getMembership(teamId, invitedUser.id);
    if(alreadyMember){
        throw new AppError("This user is already a member of the team", 409);
    }

    //Was this person already invited?
    const pending = await invitationService.findPendingInvitation(teamId, email);
    if(pending){
        throw new AppError("This email already has a pending invitation", 409);
    }

    const invitation = await invitationService.createInvitation(teamId, email, req.user.id);

    res.status(201).json({
        status : "success",
        message : "Invitation sent",
        data : {invitation},
    })
}

module.exports = {
    createTeam,
    getMyTeams,
    getMembers,
    inviteMember,
}