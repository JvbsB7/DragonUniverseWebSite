import type { Metadata } from "next";
import { LinkButton } from "@/components/button";
import { SkinViewer } from "@/components/skin-viewer/skin-viewer";

export const metadata: Metadata = {
  title: { absolute: "Página não encontrada | Dragon Universe" },
  description: "Esta página foi destruída por um Hakai. Volte ao início ou explore a wiki do Dragon Universe.",
};

export default function NotFound() {
  return (
    <div className="du-container flex max-w-2xl flex-col items-center gap-6 py-24 text-center">
      <SkinViewer
        skin="/skins/luan.png"
        animation="fly"
        alt="Luan Dias, o @luan_dias, voando pela página destruída."
        className="h-56 w-48 max-w-full"
      />
      <p className="font-display text-sm font-semibold tracking-widest text-action">Erro 404</p>
      <h1>Esta página foi destruída por um Hakai</h1>
      <p className="text-muted-foreground">O endereço que você procurou não existe mais, ou nunca existiu. Que tal voltar para um lugar seguro?</p>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/" variant="primary">Voltar ao início</LinkButton>
        <LinkButton href="/wiki">Explorar a wiki</LinkButton>
      </div>
      <p className="text-sm text-muted-foreground">Achou um link quebrado? Avise a equipe no Discord.</p>
    </div>
  );
}
