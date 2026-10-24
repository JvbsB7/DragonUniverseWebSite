// Dados gerais do site.
export const siteConfig = {
  name: "Dragon Universe",
  // URL pública (GitHub Pages, em subpasta). Com domínio próprio, defina NEXT_PUBLIC_SITE_URL no build ou troque aqui.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jvbsb7.github.io/DragonUniverseWebSite",
  description:
    "Add-on gratuito de fãs que leva Dragon Ball ao Minecraft Bedrock: 7 raças, transformações, ataques de ki e 47 missões. Versão de teste.",
  nav: [
    { href: "/sobre", label: "O projeto" },
    { href: "/wiki", label: "Wiki" },
    { href: "/novidades", label: "Novidades" },
    { href: "/roadmap", label: "Em desenvolvimento" },
    { href: "/galeria", label: "Galeria" },
    { href: "/instalar", label: "Como instalar" },
    { href: "/apoie", label: "Apoie" },
  ],
  // Menu completo (v2-04-design.md §7.4): atalhos da hotbar primeiro, depois o resto. Equipe e FAQ ficam fora do cabeçalho.
  menu: [
    { href: "/", label: "Início", group: "atalhos" },
    { href: "/wiki", label: "Wiki", group: "atalhos" },
    { href: "/novidades", label: "Novidades", group: "atalhos" },
    { href: "/instalar", label: "Como instalar", group: "atalhos" },
    { href: "/sobre", label: "O projeto", group: "resto" },
    { href: "/roadmap", label: "Em desenvolvimento", group: "resto" },
    { href: "/galeria", label: "Galeria", group: "resto" },
    { href: "/apoie", label: "Apoie", group: "resto" },
    { href: "/equipe", label: "Equipe", group: "resto" },
    { href: "/faq", label: "FAQ", group: "resto" },
  ],
} as const;
