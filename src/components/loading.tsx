"use client";

import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "@/translations";

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm py-6">
      <Loader2 className="animate-spin h-4 w-4 text-primary" />
      <span>{t("General.loading", "Loading calculator...")}</span>
    </div>
  );
}
