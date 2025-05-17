"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TranslationFn } from "@/types";

interface CookieBannerOptionsViewProps {
  t: TranslationFn;
  analyticsEnabled: boolean;
  onAnalyticsChange: (enabled: boolean) => void;
  onSavePreferences: () => void;
  onBack: () => void;
}

export function CookieBannerOptionsView({
  t,
  analyticsEnabled,
  onAnalyticsChange,
  onSavePreferences,
  onBack,
}: CookieBannerOptionsViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      <h3 className="text-xl font-semibold text-center mb-4">
        {t("ConsentBanner.optionsTitle", {
          defaultValue: "Manage Your Cookie Preferences",
        })}
      </h3>
      <p className="text-sm text-center text-muted-foreground mb-6 max-w-sm">
        {t("ConsentBanner.optionsMessage", {
          defaultValue:
            "You can choose which types of cookies to allow. For more details, please read our privacy policy.",
        })}
      </p>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/30">
          <div>
            <label htmlFor="necessaryCookies" className="font-medium text-sm">
              {t("ConsentBanner.necessaryCookies.label", {
                defaultValue: "Strictly Necessary Cookies",
              })}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("ConsentBanner.necessaryCookies.description", {
                defaultValue:
                  "These cookies are essential for the website to function and cannot be switched off.",
              })}
            </p>
          </div>
          <Switch id="necessaryCookies" checked disabled />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/30">
          <div>
            <label htmlFor="analyticsCookies" className="font-medium text-sm">
              {t("ConsentBanner.analyticsCookies.label", {
                defaultValue: "Analytics Cookies",
              })}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("ConsentBanner.analyticsCookies.description", {
                defaultValue:
                  "These cookies help us understand how visitors interact with our website.",
              })}
            </p>
          </div>
          <Switch
            id="analyticsCookies"
            checked={analyticsEnabled}
            onCheckedChange={onAnalyticsChange}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full">
        <Button variant="outline" onClick={onBack} className="w-full">
          {t("ConsentBanner.backButton", { defaultValue: "Back" })}
        </Button>
        <Button onClick={onSavePreferences} className="w-full">
          {t("ConsentBanner.saveButton", { defaultValue: "Save Preferences" })}
        </Button>
      </div>
    </div>
  );
}
