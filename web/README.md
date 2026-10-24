# Dragon Universe: site e wiki (v2)

Next.js 16 (App Router, TypeScript), Tailwind v4, shadcn/ui, Zustand, Lucide e skinview3d.
Exportação estática: o resultado do build é a pasta `out/`, só arquivos, sem Node no servidor.

## Rodar em desenvolvimento

```bash
npm install
npm run dev        # http://localhost:3000
```

## Gerar o build e servir o `out/`

```bash
npm run build      # gera out/
npx eslint src     # lint
```

Sirva `out/` com qualquer servidor de arquivos estáticos. As rotas são arquivos `.html`
sem a extensão na URL (`/wiki.html` responde em `/wiki`), então o servidor precisa
tentar `<caminho>.html` (no nginx: `try_files $uri $uri.html $uri/ =404;`).
Para um teste rápido: `npx serve out`.

## Configuração

- `src/config/site.ts`: nome, descrição, navegação e `url`. A `url` pública (hoje o GitHub Pages,
  `https://jvbsb7.github.io/DragonUniverseWebSite`) alimenta canonical, `og:url`, `og:image`, `sitemap.xml` e `robots.txt`.
  Pode ser trocada sem editar código com a variável `NEXT_PUBLIC_SITE_URL` no build.
- `src/config/links.ts`: Discord, GitHub, download e apoio (`null` = "Em breve").
- `src/config/plans.ts`: planos de apoio. Para ligar, preencha `tiers` (com `url`) e mude `plansApproved` para `true`.

## Publicar no GitHub Pages (subpasta)

O site público fica em `https://jvbsb7.github.io/DragonUniverseWebSite/`. A publicação é automática:
o workflow `.github/workflows/deploy-pages.yml` (na raiz do repositório) roda em todo push na `main`
(e manualmente, em Actions > "Publicar no GitHub Pages" > Run workflow). Ele faz `npm ci`, `npm run build`
com `NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite` e publica `web/out`.

Uma vez, no GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.

Como funciona a subpasta:

- `NEXT_PUBLIC_BASE_PATH` liga `basePath`/`assetPrefix` e `trailingSlash` (rotas viram `pasta/index.html`) no `next.config.ts`.
  Vazio = build na raiz do domínio, igual ao desenvolvimento.
- Tudo que **não** passa pelo `next/link` precisa do helper `asset()` (`src/lib/asset.ts`): `<img src>`, `srcset` (`assetSet()`),
  `fetch`, texturas das skins, SVG do logo 3D, ícones. Caminho novo em `/img/...` ou `/skins/...` deve usar `asset("/img/...")`.
  Links internos usam `next/link` (ou `LinkButton`, que já usa).
- `public/.nojekyll` acompanha o build; o deploy por Actions não usa Jekyll, então é só garantia.
- O `404.html` do build é servido pelo Pages para endereços inexistentes da subpasta.
- O `robots.txt` do projeto fica em `/DragonUniverseWebSite/robots.txt`; buscadores só leem o da raiz do host. Sem efeito prático no `github.io`.

Testar a subpasta localmente (sem sobrescrever o `out/` normal): copie `web/` sem `node_modules`, `.next` e `out`
para outra pasta, ligue o `node_modules` (`cp -al`), rode `NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite npm run build` e sirva
`out/` sob `/DragonUniverseWebSite/` (por exemplo com `serve-pages.js` em `backups-v2/`, em `127.0.0.1:8093`).

### Trocar para domínio próprio depois

1. No DNS, aponte o domínio para o GitHub Pages e configure-o em Settings > Pages > Custom domain (o GitHub cria o `CNAME`;
   em publicação por Actions, o domínio vem das configurações, não de arquivo).
2. No workflow, **remova** `NEXT_PUBLIC_BASE_PATH` (domínio na raiz = sem subpasta) e acrescente `NEXT_PUBLIC_SITE_URL: https://seudominio.com.br`
   no passo de build.
3. Em `src/config/site.ts` o valor padrão de `url` pode ser atualizado para o novo endereço.
4. Confira canonical, `og:image`, `sitemap.xml` e `robots.txt` no `out/` e rode o rastreador de links.

## Adicionar uma página na wiki

O conteúdo fica em `content/wiki/<categoria>/`. Basta criar o arquivo; não é preciso mexer em código.
O índice de busca, o `sitemap.xml` e as rotas são gerados no build.

1. Escolha a categoria (a pasta). Slugs: `racas`, `transformacoes`, `ataques-de-ki`, `tecnicas`, `fusoes`, `voo`,
   `progressao-e-combate`, `treinamento-e-mestres`, `historia-e-sagas`, `planetas-e-dimensoes`,
   `esferas-do-dragao`, `multiplayer`, `construcoes`.
2. Crie `content/wiki/<categoria>/<pagina>.mdx` (o nome do arquivo é a URL):

```mdx
---
title: Saiyajin
description: Uma frase para a busca e para o Google.
category: racas            # igual ao nome da pasta
status: no-jogo            # no-jogo | em-desenvolvimento | planejado
image: null                # ou "/img/arquivo.webp"; null mostra "Imagem em breve"
order: 1
---

## Primeira seção

Texto em Markdown simples. Use `##` e `###` (viram o sumário lateral). Sem JSX.
```

3. A introdução de uma categoria fica em `content/wiki/<categoria>/_categoria.mdx`, com `title`, `description` e `order`.
4. Rode `npm run build`. Front-matter faltando ou `status` inválido derruba o build com o caminho do arquivo e o campo.

Links internos começam com `/` (ex.: `/wiki/racas/saiyajin`); links externos abrem em nova aba.

## Skins em 3D (arte decorativa)

As skins são arte, não um visualizador: não há controles nem foco de teclado. O sentido de cada cena vem do texto alternativo (`role="img"` com `aria-label`).

- **Cena da equipe** (`src/components/team-scene/`): João, Ricardo e Luan juntos, interagindo, em um único canvas. Aparece no topo de `/equipe` e no bloco "Quem faz o Dragon Universe" da home. Os dados da equipe ficam em `src/config/equipe.ts`.
- **Apresentadores** (`src/components/presenter.tsx`): uma skin 3D com balão de fala. Usados na home (João e Ricardo), `/wiki` (João), `/instalar` (João), `/roadmap` (Ricardo), `/apoie` (Ricardo) e no 404 (Luan voando). Uso: `<Presenter src="/skins/jvbs.png" name="João Vitor" alt="..." animation="wave">Fala.</Presenter>` (`animation`: `idle | walk | run | fly | wave`). O 404 usa `SkinViewer` direto.
- **Como o 3D é carregado:** three.js e skinview3d ficam em chunks separados (`next/dynamic`, `ssr: false`). O canvas só nasce depois da primeira interação (rolar, tocar, mover o mouse ou usar o teclado), enquanto o elemento está visível na tela, e é descartado (`dispose` e perda do contexto WebGL) quando sai. No máximo 2 canvas vivos no site inteiro (`MAX_LIVE_CANVAS` em `src/store/skin-viewer.ts`).
- **Fallback:** sem WebGL, com `prefers-reduced-motion` ou antes de o 3D carregar, aparece a cabeça 2D da skin (`SkinFace`). Nunca há caixa vazia.

## SEO

Cada página usa `pageMetadata()` (`src/lib/seo.ts`): title com a marca, description, canonical, `og:title`, `og:description`, `og:url` e `og:image`, tudo a partir de `siteConfig.url`.
`sitemap.xml` e `robots.txt` saem de `src/app/sitemap.ts` e `src/app/robots.ts`.
