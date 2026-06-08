"use client";

import { ReactNode, useState } from "react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditableFormModal } from "./EditableFormModal";

interface EditableSectionProps<T> {
  title: string;
  description: string;
  icon: ReactNode;
  loading?: boolean;
  modalTitle: string;
  modalDescription: string;
  data: T;
  onSave: (data: T) => Promise<void>;
  renderDisplay: () => ReactNode;
  renderForm: (props: FormRenderProps<T>) => ReactNode;
  successMessage: string;
  errorMessage: string;
  cancelLabel: string;
  saveLabel: string;
  savingLabel: string;
}

export interface FormRenderProps<T> {
  data: T;
  isLoading: boolean;
  onChange: <K extends keyof T>(field: K, value: T[K]) => void;
}

export default function EditableSection<T>({
  title,
  description,
  icon,
  loading,
  modalTitle,
  modalDescription,
  data,
  onSave,
  renderDisplay,
  renderForm,
  successMessage,
  errorMessage,
  cancelLabel,
  saveLabel,
  savingLabel,
}: EditableSectionProps<T>) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 shrink-0 text-ink-3 [&_svg]:size-4">{icon}</span>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-medium leading-none tracking-tight">{title}</h3>
                <DashboardCardDescription>{description}</DashboardCardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
              aria-label={`Edit ${title}`}
              className="shrink-0 gap-1.5 text-ink-2"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-5 border-t border-hairline pt-5">
          {renderDisplay()}
        </DashboardCardContent>
      </DashboardCard>

      <EditableFormModal
        icon={icon}
        title={modalTitle}
        description={modalDescription}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={data}
        onSave={onSave}
        renderForm={renderForm}
        successMessage={successMessage}
        errorMessage={errorMessage}
        cancelLabel={cancelLabel}
        saveLabel={saveLabel}
        savingLabel={savingLabel}
      />
    </>
  );
}
