"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createPost, updatePost } from "@/lib/actions/posts.actions";
import { Upload, X, Loader2, ImageIcon, RefreshCw, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { LocationPost, PostType, CallToActionType } from "@/lib/db/schema/location-posts.schema";

interface PostComposerProps {
  locationId: string;
  editingPost?: LocationPost | null;
  onPostCreated: () => void;
  onCancelEdit?: () => void;
}

export function PostComposer({ locationId, editingPost, onPostCreated, onCancelEdit }: PostComposerProps) {
  const t = useTranslations("dashboard.posts.composer");
  const [isLoading, setIsLoading] = useState(false);

  const [summary, setSummary] = useState(editingPost?.summary ?? "");
  const [topicType, setTopicType] = useState<PostType>(editingPost?.topicType ?? "STANDARD");
  const [mediaUrl, setMediaUrl] = useState(editingPost?.mediaUrl ?? "");
  const [ctaType, setCtaType] = useState<CallToActionType | "">(editingPost?.callToAction?.actionType ?? "");
  const [ctaUrl, setCtaUrl] = useState(editingPost?.callToAction?.url ?? "");

  const [eventTitle, setEventTitle] = useState(editingPost?.event?.title ?? "");
  const [eventStartDate, setEventStartDate] = useState<Date | undefined>(
    editingPost?.event?.startDate ? parseISO(editingPost.event.startDate) : undefined
  );
  const [eventEndDate, setEventEndDate] = useState<Date | undefined>(
    editingPost?.event?.endDate ? parseISO(editingPost.event.endDate) : undefined
  );

  const [offerCode, setOfferCode] = useState(editingPost?.offer?.couponCode ?? "");
  const [offerTerms, setOfferTerms] = useState(editingPost?.offer?.termsConditions ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetForm = () => {
    setSummary("");
    setTopicType("STANDARD");
    setMediaUrl("");
    setCtaType("");
    setCtaUrl("");
    setEventTitle("");
    setEventStartDate(undefined);
    setEventEndDate(undefined);
    setOfferCode("");
    setOfferTerms("");
    setUploadError(null);
  };

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("locationId", locationId);

        const res = await fetch("/api/upload/post-image", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        setMediaUrl(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploadError(msg);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [locationId]
  );

  const handleRemoveImage = useCallback(() => {
    setMediaUrl("");
    setUploadError(null);
  }, []);

  const formatDateForApi = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!summary.trim()) return;
    setIsLoading(true);

    const postData = {
      locationId,
      summary: summary.trim(),
      topicType,
      mediaUrl: mediaUrl.trim() || undefined,
      callToAction: ctaType && ctaUrl ? { actionType: ctaType, url: ctaUrl } : undefined,
      event:
        (topicType === "EVENT" || topicType === "OFFER") && eventTitle
          ? {
              title: eventTitle,
              startDate: formatDateForApi(eventStartDate),
              endDate: formatDateForApi(eventEndDate),
            }
          : undefined,
      offer:
        topicType === "OFFER"
          ? { couponCode: offerCode || undefined, termsConditions: offerTerms || undefined }
          : undefined,
    };

    try {
      if (editingPost) {
        await updatePost({ ...postData, postId: editingPost.id });
      } else {
        await createPost({ ...postData, publishImmediately });
      }
      resetForm();
      onCancelEdit?.();
      onPostCreated();
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{editingPost ? t("editTitle") : t("title")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0 space-y-4">
        <div>
          <Label>{t("postType")}</Label>
          <Select value={topicType} onValueChange={(v) => setTopicType(v as PostType)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STANDARD">{t("types.standard")}</SelectItem>
              <SelectItem value="EVENT">{t("types.event")}</SelectItem>
              <SelectItem value="OFFER">{t("types.offer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t("content")}</Label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t("contentPlaceholder")}
            className="mt-1 min-h-[100px]"
            maxLength={1500}
          />
          <p className="text-xs text-muted-foreground mt-1">{summary.length}/1500</p>
        </div>

        <div>
          <Label>{t("image")}</Label>
          <div className="mt-1">
            {mediaUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <div className="flex size-10 items-center justify-center rounded bg-primary/10">
                  <ImageIcon className="size-5 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium">{t("imageUploaded")}</span>
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <RefreshCw className="size-4 me-1" />
                  {t("imageChange")}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                  <X className="size-4 me-1" />
                  {t("imageRemove")}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("imageUploading")}
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    {t("imageUpload")}
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">{t("imageMaxSize")}</p>
            {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("ctaType")}</Label>
            <Select value={ctaType} onValueChange={(v) => setCtaType(v as CallToActionType)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("ctaNone")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEARN_MORE">{t("cta.learnMore")}</SelectItem>
                <SelectItem value="BOOK">{t("cta.book")}</SelectItem>
                <SelectItem value="ORDER">{t("cta.order")}</SelectItem>
                <SelectItem value="SHOP">{t("cta.shop")}</SelectItem>
                <SelectItem value="SIGN_UP">{t("cta.signUp")}</SelectItem>
                <SelectItem value="CALL">{t("cta.call")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("ctaUrl")}</Label>
            <Input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
              disabled={!ctaType}
            />
          </div>
        </div>

        {(topicType === "EVENT" || topicType === "OFFER") && (
          <div className="space-y-3 rounded-lg border border-border/40 p-3">
            <Label className="text-sm font-medium">{t("eventDetails")}</Label>
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder={t("eventTitlePlaceholder")}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-start font-normal",
                        !eventStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4 me-2" />
                      {eventStartDate ? format(eventStartDate, "PPP") : t("pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={eventStartDate} onSelect={setEventStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs">{t("endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-start font-normal",
                        !eventEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4 me-2" />
                      {eventEndDate ? format(eventEndDate, "PPP") : t("pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={eventEndDate} onSelect={setEventEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {topicType === "OFFER" && (
          <div className="space-y-3 rounded-lg border border-border/40 p-3">
            <Label className="text-sm font-medium">{t("offerDetails")}</Label>
            <Input
              value={offerCode}
              onChange={(e) => setOfferCode(e.target.value)}
              placeholder={t("couponCodePlaceholder")}
            />
            <Input
              value={offerTerms}
              onChange={(e) => setOfferTerms(e.target.value)}
              placeholder={t("termsPlaceholder")}
            />
          </div>
        )}

        <div className="flex gap-2 pt-2 justify-end">
          {editingPost ? (
            <>
              <Button onClick={() => onCancelEdit?.()} variant="outline" disabled={isLoading}>
                {t("cancel")}
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={isLoading || !summary.trim()}>
                {t("saveChanges")}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleSubmit(false)} disabled={isLoading || !summary.trim()} variant="outline">
                {t("saveDraft")}
              </Button>
              <Button onClick={() => handleSubmit(true)} disabled={isLoading || !summary.trim()}>
                {t("publishNow")}
              </Button>
            </>
          )}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
