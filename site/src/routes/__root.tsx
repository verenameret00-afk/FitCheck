import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FitCheck — AI-Powered Personal Styling" },
      {
        name: "description",
        content:
          "Shop your closet, not the store. FitCheck uses AI to generate outfit combos from clothes you already own. Snap your closet, get styled.",
      },
      { property: "og:title", content: "FitCheck — AI-Powered Personal Styling" },
      {
        property: "og:description",
        content:
          "Shop your closet, not the store. AI outfit generation from your own wardrobe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FitCheck — AI-Powered Personal Styling" },
      {
        name: "twitter:description",
        content: "AI outfit generation from your own wardrobe. Snap your closet, get styled.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap",
      },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0a0a0b] text-[#f5f0e8] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
