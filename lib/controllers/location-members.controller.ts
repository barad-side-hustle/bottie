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
import { defaultLocale } from "@/lib/locale";

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

    const [requester, location, owner] = await Promise.all([
      db.query.user.findFirst({ where: eq(userTable.id, this.userId) }),
      db.query.locations.findFirst({ where: eq(locations.id, locationId) }),
      this.membersRepo.getOwner(locationId),
    ]);

    if (requester && location && owner) {
      db.query.user
        .findFirst({ where: eq(userTable.id, owner.userId) })
        .then((ownerUser) => {
          if (!ownerUser?.email) return;
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const settingsUrl = `${appUrl}/dashboard/locations/${locationId}/settings`;
          return sendEmail(
            ownerUser.email,
            `${requester.name} requested access to ${location.name}`,
            AccessRequestNotificationEmail({
              requesterName: requester.name,
              requesterEmail: requester.email,
              locationName: location.name,
              message: message ?? undefined,
              settingsUrl,
            })
          );
        })
        .catch((err) => {
          console.error("[EMAIL_FAILED] access_request_notification", {
            requestId: request.id,
            locationId,
            error: err instanceof Error ? err.message : String(err),
          });
        });
    }

    return request;
  }

  async approveRequest(requestId: string): Promise<{ request: LocationAccessRequest; member: LocationMember }> {
    const request = await this.requestsRepo.getById(requestId);
    if (!request) throw new NotFoundError("Access request not found");

    await this.requireOwner(request.locationId);

    return await db.transaction(async (tx) => {
      const updatedRequest = await this.requestsRepo.approve(requestId, this.userId, tx);
      if (!updatedRequest) {
        throw new ForbiddenError("Request is no longer pending");
      }
      const member = await this.membersRepo.addMember(
        request.locationId,
        request.requesterId,
        "admin",
        this.userId,
        tx
      );
      return { request: updatedRequest, member };
    });
  }

  async rejectRequest(requestId: string): Promise<LocationAccessRequest> {
    const request = await this.requestsRepo.getById(requestId);
    if (!request) throw new NotFoundError("Access request not found");

    await this.requireOwner(request.locationId);

    const updatedRequest = await this.requestsRepo.reject(requestId, this.userId);
    if (!updatedRequest) {
      throw new ForbiddenError("Request is no longer pending");
    }
    return updatedRequest;
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

    const normalizedEmail = email.toLowerCase();

    const currentUser = await db.query.user.findFirst({ where: eq(userTable.id, this.userId) });
    if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
      throw new ForbiddenError("You cannot invite yourself");
    }

    const existingUser = await db.query.user.findFirst({ where: eq(userTable.email, normalizedEmail) });
    if (existingUser) {
      const existingMember = await this.membersRepo.getMember(locationId, existingUser.id);
      if (existingMember) {
        throw new ForbiddenError("This user is already a member of this location");
      }
    }

    const existing = await this.invitationsRepo.findPendingByEmail(locationId, normalizedEmail);
    if (existing) {
      await this.invitationsRepo.cancel(existing.id);
    }

    const { invitation, rawToken } = await this.invitationsRepo.create(locationId, normalizedEmail, role, this.userId);

    const [inviter, location] = await Promise.all([
      currentUser ? Promise.resolve(currentUser) : db.query.user.findFirst({ where: eq(userTable.id, this.userId) }),
      db.query.locations.findFirst({ where: eq(locations.id, locationId) }),
    ]);

    if (inviter && location) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const acceptUrl = `${appUrl}/${defaultLocale}/invitation/${rawToken}`;
      sendEmail(
        normalizedEmail,
        `${inviter.name} invited you to manage ${location.name} on Bottie`,
        LocationInvitationEmail({ inviterName: inviter.name, locationName: location.name, acceptUrl })
      ).catch((err) => {
        console.error("[EMAIL_FAILED] location_invitation", {
          invitationId: invitation.id,
          locationId,
          recipientEmail: normalizedEmail,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    return invitation;
  }

  async acceptInvitation(token: string): Promise<LocationMember> {
    const invitation = await this.invitationsRepo.getByToken(token);
    if (!invitation) throw new NotFoundError("INVITATION_NOT_FOUND");

    const currentUser = await db.query.user.findFirst({ where: eq(userTable.id, this.userId) });
    if (!currentUser || currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenError("INVITATION_EMAIL_MISMATCH");
    }

    if (invitation.status === "cancelled") {
      throw new ForbiddenError("INVITATION_CANCELLED");
    }
    if (invitation.status === "accepted") {
      throw new ForbiddenError("INVITATION_ALREADY_USED");
    }
    if (invitation.status !== "pending") {
      throw new ForbiddenError("INVITATION_INVALID");
    }

    if (new Date() > invitation.expiresAt) {
      throw new ForbiddenError("INVITATION_EXPIRED");
    }

    return await db.transaction(async (tx) => {
      const accepted = await this.invitationsRepo.accept(token, tx);
      if (!accepted) {
        throw new ForbiddenError("INVITATION_ALREADY_USED");
      }
      return this.membersRepo.addMember(
        invitation.locationId,
        this.userId,
        invitation.role as "admin",
        invitation.invitedBy,
        tx
      );
    });
  }

  async getPendingInvitations(locationId: string): Promise<LocationInvitation[]> {
    await this.requireOwner(locationId);
    return this.invitationsRepo.getPendingForLocation(locationId);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationsRepo.getById(invitationId);
    if (!invitation) throw new NotFoundError("Invitation not found");
    await this.requireOwner(invitation.locationId);
    await this.invitationsRepo.cancel(invitationId);
  }
}
