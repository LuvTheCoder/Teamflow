const {z} = require("zod")

const AppError = require("../utils/AppError")
const validate = require("../utils/validate");
const teamService = require("../services/teamService");
const invitationService = require("../services/invitationService");

const invitationParamsSchema = z.object({
  invitationId: z.string().uuid("must be a valid id"),
});


// Finds an invitation that belongs to the logged-in user and is still pending
async function getMyPendingInvitation(req){
    const {invitationId} = validate(invitationParamsSchema, req.params);
    const invitation = await invitationService.findInvitationById(invitationId);

    if( !invitation || invitation.email !== req.user.email){
        throw new AppError("Invitation not found!", 404);
    }

    if(invitation.status !== "PENDING"){
        throw new AppError(`Invitation has already been ${invitation.status.toLowerCase()}`, 400);
    }

    return invitation;
}

// GET /api/invitations
async function getMyInvitations(req, res) {
  const invitations = await invitationService.getPendingInvitationsForEmail(req.user.email);

  res.status(200).json({
    status: "success",
    data: { invitations },
  });
}


// POST /api/invitations/:invitationId/accept
async function acceptInvitation(req, res){
    const invitation = await getMyPendingInvitation(req);

    const existing = await teamService.getMembership(invitation.team_id, req.user.id);
    if(!existing){
        await teamService.addMember(invitation.team_id, req.user.id);
    }

    await invitationService.setInvitationStatus(invitation.id, "ACCEPTED");

    res.status(200).json({
        status: "success",
        message: "Invitation accepted, you joined the team",
    })
}

async function declineInvitation(req, res){
    const invitation = await getMyPendingInvitation(req);

    await invitationService.setInvitationStatus(invitation.id, "DECLINED");

    res.status(200).json({
        status : "success",
        message : "Invitation declined",
    })
}

module.exports = {getMyInvitations, acceptInvitation, declineInvitation}


