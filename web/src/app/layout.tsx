import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TestWarning } from "@/components/test-warning";
import { MenuHost } from "@/components/menu-host";
import { CinemaHost } from "@/components/cinema/cinema-host";
import { NuvemHost } from "@/components/nuvem/nuvem-host";
import { siteConfig } from "@/config/site";
import { defaultImage } from "@/lib/seo";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

// Fontes v3 (self-hosted, subset pt-BR, pesos mínimos; ≤ 70 KiB no total). Space Grotesk é variável (600–700).
const display = localFont({
  variable: "--next-font-display",
  display: "swap",
  src: [{ path: "./fonts/space-grotesk-latin-600-700-normal.woff2", weight: "600 700" }],
});

const body = localFont({
  variable: "--next-font-body",
  display: "swap",
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600" },
  ],
});

// Oxanium só em selos, preços e rótulos curtos (não entra no preload).
const game = localFont({
  variable: "--next-font-game",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/oxanium-latin-600-normal.woff2", weight: "600" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Ícones do emblema C (favicon 16 em grade de pixels). "?v=du" força os navegadores a largar o favicon antigo do cache (mesmo nome de arquivo). Favicon transparente; apple-touch e manifest com fundo #060A16 e margem de 12%.
  icons: {
    icon: [
      { url: asset("/img/logo/favicon-16.png?v=du"), sizes: "16x16", type: "image/png" },
      { url: asset("/img/logo/favicon-32.png?v=du"), sizes: "32x32", type: "image/png" },
      { url: asset("/img/logo/favicon-48.png?v=du"), sizes: "48x48", type: "image/png" },
    ],
    apple: { url: asset("/img/logo/apple-touch-icon-180.png?v=du"), sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: defaultImage, width: 1200, height: 630, alt: "Dragon Universe" }],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn("h-full", display.variable, body.variable, game.variable)}>
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-80 focus:rounded-md focus:bg-action focus:px-4 focus:py-3 focus:text-bg"
        >
          Pular para o conteúdo
        </a>
        <TestWarning />
        <SiteHeader />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MenuHost />
        <CinemaHost />
        <NuvemHost />
      </body>
    </html>
  );
}
