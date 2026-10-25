// Dados gerais do site.
export const siteConfig = {
  name: "Dragon Universe",
  // URL pública (GitHub Pages, em subpasta). Com domínio próprio, defina NEXT_PUBLIC_SITE_URL no build ou troque aqui.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jvbsb7.github.io/DragonUniverseWebSite",
  description:
    "Add-on gratuito de fãs que leva Dragon Ball ao Minecraft Bedrock: 6 raças já no jogo, transformações, ataques de ki e 47 missões. Versão de teste.",
  // Navegação v3 (copy v3 A.2): sete destinos + Discord (botão) + "Mais". Raças, Transformações e Universo reaproveitam as
  // categorias da wiki, então nenhuma URL da v2 muda.
  nav: [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "O Projeto" },
    { href: "/wiki/racas", label: "Raças" },
    { href: "/wiki/transformacoes", label: "Transformações" },
    { href: "/wiki/planetas-e-dimensoes", label: "Universo" },
    { href: "/roadmap", label: "Desenvolvimento" },
    { href: "/apoie", label: "Apoie o Projeto" },
  ],
  // Grupo "Mais" (cabeçalho desktop, menu móvel): o que o brief não põe no menu principal.
  mais: [
    { href: "/wiki", label: "Wiki" },
    { href: "/novidades", label: "Novidades" },
    { href: "/galeria", label: "Galeria" },
    { href: "/instalar", label: "Como instalar" },
    { href: "/equipe", label: "Equipe" },
    { href: "/faq", label: "FAQ" },
  ],
} as const;
