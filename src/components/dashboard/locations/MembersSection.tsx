"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { sileo } from "sileo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Input } from "@/components/ui/input";
import { Crown, Shield, Users, UserMinus, Check, X, Send, Trash2, Mail, UserPlus, ClipboardList } from "lucide-react";
import type { LocationMemberWithUser } from "@/lib/db/repositories/location-members.repository";
import type { AccessRequestWithRequester } from "@/lib/db/repositories/location-access-requests.repository";
import type { LocationInvitation } from "@/lib/db/schema";
import {
  getLocationMembers,
  removeMember,
  approveAccessRequest,
  rejectAccessRequest,
  inviteMember,
  cancelInvitation,
  getPendingRequests,
  getPendingInvitations,
} from "@/lib/actions/location-members.actions";

function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
    </div>
  );
}

interface MembersSectionProps {
  locationId: string;
  currentUserRole: "owner" | "admin";
  currentUserId: string;
  initialMembers: LocationMemberWithUser[];
  initialRequests: AccessRequestWithRequester[];
  initialInvitations: LocationInvitation[];
}

export function MembersSection({
  locationId,
  currentUserRole,
  currentUserId,
  initialMembers,
  initialRequests,
  initialInvitations,
}: MembersSectionProps) {
  const t = useTranslations("dashboard.settings.members");
  const [members, setMembers] = useState(initialMembers);
  const [requests, setRequests] = useState(initialRequests);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const isOwner = currentUserRole === "owner";

  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return 0;
  });

  const setLoading = (id: string, loading: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [id]: loading }));
  };

  const refreshData = async () => {
    try {
      const [newMembers, newRequests, newInvitations] = await Promise.all([
        getLocationMembers({ locationId }),
        isOwner ? getPendingRequests({ locationId }) : Promise.resolve([]),
        isOwner ? getPendingInvitations({ locationId }) : Promise.resolve([]),
      ]);
      setMembers(newMembers);
      setRequests(newRequests);
      setInvitations(newInvitations);
    } catch {}
  };

  const handleRemoveMember = async (targetUserId: string) => {
    setLoading(`remove-${targetUserId}`, true);
    try {
      await removeMember({ locationId, targetUserId });
      await refreshData();
      sileo.success({ title: t("memberRemoved") });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : t("errorRemovingMember") });
    } finally {
      setLoading(`remove-${targetUserId}`, false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setLoading(`approve-${requestId}`, true);
    try {
      await approveAccessRequest({ requestId });
      await refreshData();
      sileo.success({ title: t("requestApproved") });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : t("errorApprovingRequest") });
    } finally {
      setLoading(`approve-${requestId}`, false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(`reject-${requestId}`, true);
    try {
      await rejectAccessRequest({ requestId });
      await refreshData();
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : t("errorRejectingRequest") });
    } finally {
      setLoading(`reject-${requestId}`, false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await inviteMember({ locationId, email: inviteEmail.trim(), role: "admin" });
      setInviteEmail("");
      await refreshData();
      sileo.success({ title: t("invitationSent") });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : t("errorInviting") });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setLoading(`cancel-${invitationId}`, true);
    try {
      await cancelInvitation({ invitationId });
      await refreshData();
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : t("errorCancellingInvitation") });
    } finally {
      setLoading(`cancel-${invitationId}`, false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <SectionHeading icon={<Users />} title={t("title")} />
          <DashboardCardDescription>{t("description")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-2">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9">
                  {member.user.image && <AvatarImage src={member.user.image} alt={member.user.name} />}
                  <AvatarFallback className="text-xs">{getInitials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={member.role === "owner" ? "brand" : "secondary"} className="gap-1">
                  {member.role === "owner" ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {t(member.role)}
                </Badge>
                {isOwner && member.userId !== currentUserId && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={loadingActions[`remove-${member.userId}`]}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </DashboardCardContent>
      </DashboardCard>

      {isOwner && requests.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader>
            <SectionHeading icon={<ClipboardList />} title={t("pendingRequests")} />
            <DashboardCardDescription>{t("pendingRequestsDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/40 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {request.requester.image && (
                      <AvatarImage src={request.requester.image} alt={request.requester.name} />
                    )}
                    <AvatarFallback className="text-xs">{getInitials(request.requester.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{request.requester.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{request.requester.email}</p>
                    {request.message && (
                      <p className="mt-1 text-xs italic text-muted-foreground">&quot;{request.message}&quot;</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={loadingActions[`approve-${request.id}`]}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {t("approve")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={loadingActions[`reject-${request.id}`]}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("reject")}
                  </Button>
                </div>
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {isOwner && invitations.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader>
            <SectionHeading icon={<Mail />} title={t("pendingInvitations")} />
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">{t("invitedAs", { role: t("admin") })}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleCancelInvitation(invitation.id)}
                  disabled={loadingActions[`cancel-${invitation.id}`]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {isOwner && (
        <DashboardCard>
          <DashboardCardHeader>
            <SectionHeading icon={<UserPlus />} title={t("inviteTitle")} />
            <DashboardCardDescription>{t("inviteDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder={t("inviteEmailPlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1"
              />
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="gap-1.5">
                <Send className="h-4 w-4" />
                {t("inviteButton")}
              </Button>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
