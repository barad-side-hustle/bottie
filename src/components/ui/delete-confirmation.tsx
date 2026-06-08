"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationProps {
  title: string;
  description: string;
  warningText?: string;
  confirmationText: string;
  confirmationLabel: string;
  confirmationPlaceholder?: string;
  onDelete: () => Promise<void>;
  deleteButtonText: string;
  dangerZoneLabel: string;
  irreversibleActionsLabel: string;
  cancelLabel: string;
  textMismatchMessage: string;
  deletingLabel: string;
  className?: string;
}

export function DeleteConfirmation({
  title,
  description,
  warningText,
  confirmationText,
  confirmationLabel,
  confirmationPlaceholder,
  onDelete,
  deleteButtonText,
  dangerZoneLabel,
  irreversibleActionsLabel,
  cancelLabel,
  textMismatchMessage,
  deletingLabel,
  className = "",
}: DeleteConfirmationProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card className={cn("border-hairline", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
            <CardTitle className="font-medium text-destructive">{dangerZoneLabel}</CardTitle>
          </div>
          <CardDescription>{irreversibleActionsLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-negative-tint p-4">
            <h4 className="mb-2 font-medium text-destructive">{title}</h4>
            <p className="mb-4 text-sm text-ink-2">{description}</p>
            {warningText && <p className="mb-4 text-sm font-medium text-destructive">{warningText}</p>}
            <Button variant="destructive" onClick={() => setShowDialog(true)} className="gap-2">
              {deleteButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={title}
        description={description}
        confirmText={deleteButtonText}
        cancelText={cancelLabel}
        onConfirm={onDelete}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={confirmationText}
        confirmationLabel={confirmationLabel}
        confirmationPlaceholder={confirmationPlaceholder}
        textMismatchMessage={textMismatchMessage}
        loadingText={deletingLabel}
      />
    </>
  );
}
