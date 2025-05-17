"use client";

import PrivacyWidgetSkeleton from "@/components/privacy-widget-skeleton";
import React from "react";
import dynamic from "next/dynamic";

interface PrivacyWidgetProps {
  lang: string;
}

const PrivacyWidget = dynamic<PrivacyWidgetProps>(
  () =>
    Promise.resolve(({ lang }: PrivacyWidgetProps) => {
      const widgetHtml = `<privacybee-widget website-id="cmama28x0005vjo8hyyznlmon" type="dsgvo" lang="${lang}" data-theme="dark"></privacybee-widget>`;
      // The script for privacybee is loaded in the root layout (layout.tsx)
      return (
        <div
          dangerouslySetInnerHTML={{ __html: widgetHtml }}
          className="cursor-default"
        />
      );
    }),
  {
    ssr: false,
    loading: () => <PrivacyWidgetSkeleton />,
  },
);

interface PrivacyWidgetClientWrapperProps {
  lang: string;
}

export default function PrivacyWidgetClientWrapper({
  lang,
}: PrivacyWidgetClientWrapperProps) {
  return <PrivacyWidget lang={lang} />;
}
