import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/pages/settings/settings-layout";
import { Head } from "@inertiajs/react";
import { SchemeSwitcher, ThemeSwitcher } from "@/components/theme-switcher";

const title = "Appearance";

export default function Appearance() {
  return (
    <>
      <Head title={title} />
      <h1 className="sr-only">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>

          <CardDescription className="max-w-lg">
            Choose the most comfortable theme to make your experience using this app more enjoyable.
          </CardDescription>
        </CardHeader>

        <CardContent className="max-w-lg">
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="mb-1 font-medium text-fg text-sm">Mode</h2>
              <p className="mb-3 text-muted-fg text-sm">Light, dark, or automatic.</p>
              <ThemeSwitcher />
            </section>

            <section>
              <h2 className="mb-1 font-medium text-fg text-sm">Color scheme</h2>
              <p className="mb-3 text-muted-fg text-sm">
                Pick the primary color tone. Applies to both light and dark mode.
              </p>
              <SchemeSwitcher />
            </section>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

Appearance.layout = [AppLayout, SettingsLayout];
