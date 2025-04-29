"use client";

import { I18nextProvider } from "react-i18next"; // Import the provider
import React from "react";
import i18nInstance from "../i18n-client"; // Import the initialized i18next instance

// This component now correctly provides the i18n instance via context
export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
