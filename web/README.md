# Dragon Universe: site e wiki

Next.js 16 (App Router, TypeScript), Tailwind v4, Base UI, Zustand, Lucide, three 0.186.1, skinview3d (só o modelo `PlayerObject`), React Three Fiber + drei, Motion e GSAP (as últimas só sob demanda).
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
- `src/config/plans.ts`: níveis de apoio (nomes, preços, benefícios), comparativo e perguntas. Os controles ficam sempre desativados ("Em breve"); não há checkout nem formulário.

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
`out/` sob `/DragonUniverseWebSite/` em `127.0.0.1` com qualquer servidor estático que mapeie esse prefixo.

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

## Personagens, cenas e efeitos (v4)

Os três personagens da equipe (JvbsBR, rvmm255 e Luan Dias) usam as skins reais em `public/skins/`. Não há GLB: cada skin é aplicada ao
modelo de caixas `PlayerObject` (importado de `skinview3d/libs/model.js`, só o modelo, sem o viewer) dentro do canvas do R3F, e as poses
vêm de **clipes como dados**.

- **Biblioteca de poses:** `src/lib/personagens/` (`tipos.ts`, `nucleo.ts`, `adaptador-skinview.ts`, `clipes.ts`). Cada clipe é uma tabela de chaves por osso
  (`root`, `body`, `head`, `rightArm`, `leftArm`, `rightLeg`, `leftLeg`; radianos, ordem de Euler YXZ, 1 unidade = 1 px de skin). `amostrar(clipe, t)` devolve a pose,
  `misturar` faz a transição entre clipes e `criarAdaptador(player).aplicar(pose)` move os ossos. Gestos só do site ficam em `src/components/cinema/clipes-site.ts`.
- **Canvas "cinema" compartilhado** (`src/components/cinema/`): um único canvas R3F (`frameloop="demand"`, `View` do drei) desenha todas as vistas 3D da página.
  `CinemaHost` fica no layout e só carrega o canvas quando uma vista (`CinemaView`) entra na tela, depois da primeira interação, com vaga no limite global de **2 canvases**
  (`MAX_LIVE_CANVAS`, o outro é o do hero). Ele é liberado 3 s depois de nenhuma vista estar visível e 5 s depois de a aba ficar oculta.
- **Cenas:** batalha da Home (`src/components/batalha/`; a cena é função pura do tempo, em `batalha-linha.ts`), vitrine da equipe (`src/components/team-scene/`),
  apresentadores (`src/components/skin-viewer/`, usados por `Presenter`) e 404. Dados da equipe em `src/config/equipe.ts`; mídia da batalha em `src/config/batalha.ts`.
- **Níveis de qualidade** (`src/lib/perfil.ts`): `estatico` (movimento reduzido, economia de dados ou botão "Reduzir animações"), `baixo` (celular, ponteiro grosso, ≤ 4 núcleos/GB),
  `medio` e `alto`. O monitor de quadros desce um nível se a cena ficar lenta. Sem WebGL (estático e baixo): pôster, descrição e, no celular, o clipe vertical (`public/video/batalha/`,
  `preload="none"`). O estado do controle "Reduzir animações" fica em `localStorage` (`du-reduzir-animacoes`).
- **Efeitos só com CSS e sprites (sem WebGL):** esferas de energia (`src/components/esferas/`, `src/store/esferas.ts`, sprites em `public/img/esferas/`), leitor de dados nos cartões de raça
  (`src/components/leitor-de-dados.tsx`; os dados são lidos da wiki no build), nave do Universo (`public/img/nave/`), Nuvem dourada (`src/components/nuvem/`, `public/img/nuvem/`;
  faixas reservadas com `<FaixaNuvem id="..." />`), transições de ki e ambiente (`src/app/globals.css`).

### Onde ficam os ativos de personagem

| O quê | Onde |
|---|---|
| Skins (PNG 64×64, não editar) | `public/skins/jvbs.png`, `rvmm.png`, `luan.png` |
| Pôsteres de corpo inteiro (cartões do celular) | `public/img/equipe/<slug>-corpo-{1x,2x}-fundo.webp` |
| Pôster da batalha e quadros de referência | `public/img/batalha/batalha-poster-{576,1152}.webp` |
| Clipe vertical do celular (MP4, WebM e pôsteres) | `public/video/batalha/mobile-vertical.*` |
| Sprites de esferas, nave e Nuvem dourada | `public/img/esferas/`, `public/img/nave/`, `public/img/nuvem/` |
| Planeta do Bills (modelo 3D e pôsteres) | `public/models/planeta-do-bills-medio.glb`, `public/img/bills/` |

Todo caminho de ativo deve passar por `asset()` para funcionar na subpasta do GitHub Pages (vale também para `url()` em CSS: use variáveis CSS definidas inline, como em `esfera.tsx`).

### Build de QA (parâmetros de teste)

Alguns parâmetros de URL existem **só em build de QA**; no build de produção são ignorados:

```bash
NEXT_PUBLIC_DU_QA=1 npm run build          # build de QA (out/)
NEXT_PUBLIC_DU_QA=1 NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite npm run build   # idem, na subpasta
```

| Parâmetro | Efeito |
|---|---|
| `?batalha-quadro=4.5` | congela a batalha no instante (s), para capturas exatas sem depender do fps |
| `?du-sem-degradar` | desliga a queda automática de qualidade (útil com renderização por software) |
| `?nuvem=1` | solta a Nuvem dourada na primeira faixa visível, sem as esperas |

Nunca publique um build de QA. O workflow do GitHub Pages usa o build normal.

## O que mudou na v3 e como mexer

- **Tokens:** `src/app/tokens.css` (nomes `--du-*` mantidos; valores da paleta v3, raios 20/12 px, sombras suaves). Contorno decorativo = `border-edge`; contorno de controle = `border-border` (`#A8B6D0`, 3:1). Botão primário `#1674FF` com texto `#060A16` (4,68:1): **nunca** texto claro sobre o azul.
- **Fontes** (`src/app/fonts/`, self-hosted, subset pt-BR, ~60 KB no total): Space Grotesk 600–700 (variável), Inter 400 e 600, Oxanium 600 (`font-game`: selos, preços e rótulos curtos). Para regerar o subset use `subset-font` com ASCII + Latin-1 + pontuação tipográfica.
- **Navegação** (`src/config/site.ts`: `nav` e `mais`): cabeçalho flutuante (`header-shell.tsx` mede a ocupação e publica `--du-header-offset`, usado por `scroll-padding`/`scroll-margin` e pelo sumário da wiki; um `focusin` rola o foco para fora da barra) e menu em tela cheia no celular (`menu-sheet.tsx`). **Não há hotbar.** As rotas da v2 não mudaram; `/wiki/racas/demonio` é uma página-ponte (meta refresh) para `/wiki/racas/glind`.
- **Perfil leve** (`src/lib/perfil.ts`): movimento reduzido, economia de dados, ≤ 4 núcleos, ≤ 4 GB, tela < 768 px ou ponteiro grosso → sem WebGL, sem GSAP, sem blur (`<html data-perfil="leve">`). Nesse perfil o hero é o 2.5D estático.
- **Hero** (`src/components/hero/`): H1 em texto (é ele ou o pôster que fecha o LCP; **não anime a opacidade do H1**), logo SVG, print inteiro do Planeta do Bills em camada própria com legenda fora da mídia. A cena R3F (`hero-scene.tsx`: logo 3D aprovado + `Points` + profundidade do mouse ≤ 3°, `frameloop="demand"`) só entra no desktop completo, após interação ou 8 s, com vaga no limite de **2 canvases** (`store/skin-viewer.ts`). Para trocar o print por um `.glb` do Ricardo, mantenha o mesmo espaço e use o print como pôster durante carregamento, erro e falta de vaga.
- **Bibliotecas sob demanda** (nunca no caminho crítico): R3F/drei/three (`next/dynamic`, `ssr:false`), Motion (`motion-lazy.tsx`: `motion/mini`, só após a 1ª troca feita pela pessoa), GSAP + ScrollTrigger (`home-reveal.tsx`, só perfil completo). Com `prefers-reduced-motion` nada disso é baixado.
- **Compatibilidade three 0.186 × skinview3d 3.4.2:** `overrides` do `package.json` mantém **um** `three`; `src/lib/three-compat.ts` filtra só o aviso `THREE.Clock` (usado por dentro do R3F) nos módulos 3D. Ao atualizar o three, rever.
- **Conteúdo:** raças em `src/config/racas.ts` (pôsteres em `public/img/racas/`), destinos em `src/config/universo.ts`, transformações lidas da wiki (`src/lib/transformacoes-data.ts`), apoio em `src/config/plans.ts`.
- **Testar:** `npx tsc --noEmit && npx eslint && npx next build`; subpasta com `NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite`. Conferir: 0 overflow a 320/375 px com 100% e 200% de texto, máximo de 2 canvases, 0 canvas e 0 JS 3D com movimento reduzido, 0 `<form>` em `/apoie`.

## SEO

Cada página usa `pageMetadata()` (`src/lib/seo.ts`): title com a marca, description, canonical, `og:title`, `og:description`, `og:url` e `og:image`, tudo a partir de `siteConfig.url`.
`sitemap.xml` e `robots.txt` saem de `src/app/sitemap.ts` e `src/app/robots.ts`.
