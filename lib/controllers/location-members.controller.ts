import {
  LocationMembersRepository,
  type LocationMemberWithUser,
} from "@/lib/db/repositories/location-members.repository";
import {
  LocationAccessRequestsRepository,
  type AccessRequestWithRequester,
} from "@/lib/db/repositories/location-access-requests.repository";
import { LocationInvitationsRepository } from "@/lib/db/repositories/location-invitations.repository";
import { getUserLocationRole } from "@/lib/db/repositories/access-conditions";
import { ForbiddenError, NotFoundError } from "@/lib/api/errors";
import type { LocationMember, LocationAccessRequest, LocationInvitation } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { user as userTable, locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/utils/email-service";
import LocationInvitationEmail from "@/lib/emails/location-invitation";
import AccessRequestNotificationEmail from "@/lib/emails/access-request-notification";

export class LocationMembersController {
  private membersRepo = new LocationMembersRepository();
  private requestsRepo = new LocationAccessRequestsRepository();
  private invitationsRepo = new LocationInvitationsRepository();

  constructor(private userId: string) {}

  private async requireOwner(locationId: string): Promise<void> {
    const role = await getUserLocationRole(this.userId, locationId);
    if (role !== "owner") {
      throw new ForbiddenError("Only the location owner can perform this action");
    }
  }

  private async requireAccess(locationId: string): Promise<void> {
    const role = await getUserLocationRole(this.userId, locationId);
    if (!role) {
      throw new ForbiddenError("You do not have access to this location");
    }
  }

  async getMembers(locationId: string): Promise<LocationMemberWithUser[]> {
    await this.requireAccess(locationId);
    return this.membersRepo.getMembers(locationId);
  }

  async updateRole(locationId: string, targetUserId: string, role: "admin"): Promise<LocationMember> {
    await this.requireOwner(locationId);
    return this.membersRepo.updateRole(locationId, targetUserId, role);
  }

  async removeMember(locationId: string, targetUserId: string): Promise<void> {
    await this.requireOwner(locationId);

    const member = await this.membersRepo.getMember(locationId, targetUserId);
    if (!member) throw new NotFoundError("Member not found");

    if (member.role === "owner") {
      const ownerCount = await this.membersRepo.countOwners(locationId);
      if (ownerCount <= 1) {
        throw new ForbiddenError("Cannot remove the last owner");
      }
    }

    await this.membersRepo.removeMember(locationId, targetUserId);
  }

  async requestAccess(locationId: string, message?: string): Promise<LocationAccessRequest> {
    const existingMember = await this.membersRepo.getMember(locationId, this.userId);
    if (existingMember) {
      throw new ForbiddenError("You are already a member of this location");
    }

    const hasPending = await this.requestsRepo.hasPendingRequest(this.userId, locationId);
    if (hasPending) {
      throw new ForbiddenError("You already have a pending access request for this location");
    }

    const request = await this.requestsRepo.create(this.userId, locationId, message);

    Promise.all([
      db.query.user.findFirst({ where: eq(userTable.id, this.userId) }),
      db.query.locations.findFirst({ where: eq(locations.id, locationId) }),
      this.membersRepo.getOwner(locationId),
    ])
      .then(async ([requester, location, owner]) => {
        if (!requester || !location || !owner) return;
        const ownerUser = await db.query.user.findFirst({ where: eq(userTable.id, owner.userId) });
        if (!ownerUser?.email) return;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const settingsUrl = `${appUrl}/dashboard/locations/${locationId}/settings`;
        sendEmail(
          ownerUser.email,
          `${requester.name} requested access to ${location.name}`,
          AccessRequestNotificationEmail({
            requesterName: requester.name,
            requesterEmail: requester.email,
            locationName: location.name,
            message: message ?? undefined,
            settingsUrl,
          })
        ).catch(console.error);
      })
      .catch(console.error);

    return request;
  }

  async approveRequest(requestId: string): Promise<{ request: LocationAccessRequest; member: LocationMember }> {
    const request = await this.requestsRepo.getById(requestId);
    if (!request) throw new NotFoundError("Access request not found");

    await this.requireOwner(request.locationId);

    const updatedRequest = await this.requestsRepo.approve(requestId, this.userId);
    const member = await this.membersRepo.addMember(request.locationId, request.requesterId, "admin", this.userId);

    return { request: updatedRequest, member };
  }

  async rejectRequest(requestId: string): Promise<LocationAccessRequest> {
    const request = await this.requestsRepo.getById(requestId);
    if (!request) throw new NotFoundError("Access request not found");

    await this.requireOwner(request.locationId);

    return this.requestsRepo.reject(requestId, this.userId);
  }

  async getPendingRequests(locationId: string): Promise<AccessRequestWithRequester[]> {
    await this.requireOwner(locationId);
    return this.requestsRepo.getPendingForLocation(locationId);
  }

  async getPendingRequestCount(): Promise<number> {
    return this.requestsRepo.getPendingCountForUser(this.userId);
  }

  async inviteByEmail(locationId: string, email: string, role: "admin"): Promise<LocationInvitation> {
    await this.requireOwner(locationId);
    const invitation = await this.invitationsRepo.create(locationId, email, role, this.userId);

    Promise.all([
      db.query.user.findFirst({ where: eq(userTable.id, this.userId) }),
      db.query.locations.findFirst({ where: eq(locations.id, locationId) }),
    ])
      .then(([inviter, location]) => {
        if (!inviter || !location) return;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const acceptUrl = `${appUrl}/en/invitation/${invitation.token}`;
        sendEmail(
          email,
          `${inviter.name} invited you to manage ${location.name} on Bottie`,
          LocationInvitationEmail({ inviterName: inviter.name, locationName: location.name, acceptUrl })
        ).catch(console.error);
      })
      .catch(console.error);

    return invitation;
  }

  async acceptInvitation(token: string): Promise<LocationMember> {
    const invitation = await this.invitationsRepo.getByToken(token);
    if (!invitation) throw new NotFoundError("Invitation not found");

    if (invitation.status !== "pending") {
      throw new ForbiddenError("This invitation has already been used or expired");
    }

    if (new Date() > invitation.expiresAt) {
      throw new ForbiddenError("This invitation has expired");
    }

    await this.invitationsRepo.accept(token);
    return this.membersRepo.addMember(
      invitation.locationId,
      this.userId,
      invitation.role as "admin",
      invitation.invitedBy
    );
  }

  async getPendingInvitations(locationId: string): Promise<LocationInvitation[]> {
    await this.requireOwner(locationId);
    return this.invitationsRepo.getPendingForLocation(locationId);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await this.invitationsRepo.cancel(invitationId);
  }
}
