import type { Metadata } from "next";

import SettingsPanel from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description: "Adjust colour and layout preferences for the activity builder.",
};

export default function SettingsPage() {
  return (
    <main>
      <div className="page-heading">
        <p className="eyebrow">Preferences</p>
        <h1>Settings</h1>
        <p>
          Adjust the interface colour theme and content width. Activity data is
          not changed by these display preferences.
        </p>
      </div>

      <SettingsPanel />
    </main>
  );
}
