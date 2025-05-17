"use client";

import { Button } from "@/components/ui/button";
import { TranslationFn } from "@/types";

interface CookieBannerMainViewProps {
  t: TranslationFn;
  onAcceptAction: () => void;
  onManageOptions: () => void;
  onOpenPrivacyAction: () => void;
}

export function CookieBannerMainView({
  t,
  onAcceptAction,
  onManageOptions,
  onOpenPrivacyAction,
}: CookieBannerMainViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      <h2
        id="cookie-dialog-title"
        className="text-2xl font-semibold text-center"
      >
        {t("ConsentBanner.headline", { defaultValue: "We use cookies" })}
      </h2>

      <p className="text-base text-center text-muted-foreground my-4 max-w-sm">
        {t("ConsentBanner.message")}
      </p>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onOpenPrivacyAction();
        }}
        className="inline-block text-sm text-primary hover:underline mb-6"
      >
        {t("ConsentBanner.privacyPolicyLink", {
          defaultValue: "View our Privacy Policy",
        })}
      </a>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="outline" onClick={onManageOptions} className="w-full">
          {t("ConsentBanner.manageButton", { defaultValue: "Manage Cookies" })}
        </Button>
        <Button onClick={onAcceptAction} className="w-full">
          {t("ConsentBanner.acceptButton", { defaultValue: "Accept All" })}
        </Button>
      </div>
    </div>
  );
}
