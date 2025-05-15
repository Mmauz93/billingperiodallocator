"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/translations";

interface LegalDocumentModalProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  title: string;
  content: string | null;
}

export function LegalDocumentModal({
  isOpen,
  onOpenChange,
  title,
  content,
}: LegalDocumentModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          {t("General.lastUpdated", { values: { date: "April 25, 2025" } })}
        </div>
        <div className="overflow-y-auto pr-6 -mr-6 pb-4 text-sm">
          <div className="space-y-4">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl font-bold my-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xl font-bold my-3" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-lg font-bold my-2" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="mb-3 leading-relaxed" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-6 mb-3" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-6 mb-3" {...props} />
                ),
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                a: ({ ...props }) => (
                  <a
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {content || ""}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t("SettingsModal.closeButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
