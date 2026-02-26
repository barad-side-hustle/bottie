"use server";

import { LocationMembersController } from "@/lib/controllers/location-members.controller";
import { createSafeAction } from "./safe-action";
import { z } from "zod";

const LocationIdSchema = z.object({
  locationId: z.string().uuid(),
});

const RequestIdSchema = z.object({
  requestId: z.string().uuid(),
});

const RemoveMemberSchema = z.object({
  locationId: z.string().uuid(),
  targetUserId: z.string(),
});

const InviteMemberSchema = z.object({
  locationId: z.string().uuid(),
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  role: z.enum(["admin"]),
});

const AcceptInvitationSchema = z.object({
  token: z.string(),
});

const InvitationIdSchema = z.object({
  invitationId: z.string().uuid(),
});

export const getLocationMembers = createSafeAction(LocationIdSchema, async ({ locationId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.getMembers(locationId);
});

export const approveAccessRequest = createSafeAction(RequestIdSchema, async ({ requestId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.approveRequest(requestId);
});

export const rejectAccessRequest = createSafeAction(RequestIdSchema, async ({ requestId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.rejectRequest(requestId);
});

export const removeMember = createSafeAction(RemoveMemberSchema, async ({ locationId, targetUserId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.removeMember(locationId, targetUserId);
});

export const inviteMember = createSafeAction(InviteMemberSchema, async ({ locationId, email, role }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.inviteByEmail(locationId, email, role);
});

export const acceptInvitation = createSafeAction(AcceptInvitationSchema, async ({ token }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.acceptInvitation(token);
});

export const getPendingRequests = createSafeAction(LocationIdSchema, async ({ locationId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.getPendingRequests(locationId);
});

export const getPendingInvitations = createSafeAction(LocationIdSchema, async ({ locationId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.getPendingInvitations(locationId);
});

export const cancelInvitation = createSafeAction(InvitationIdSchema, async ({ invitationId }, { userId }) => {
  const controller = new LocationMembersController(userId);
  return controller.cancelInvitation(invitationId);
});
