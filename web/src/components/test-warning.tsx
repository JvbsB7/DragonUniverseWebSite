import Link from "next/link";

// Barra de aviso (copy §1). Fica acima do cabeçalho em todas as páginas. Painel opaco no fluxo, sem fechar nem role="alert".
export function TestWarning() {
  return (
    <aside
      id="topo"
      aria-label="Aviso importante sobre a versão de teste e os requisitos"
      className="bg-alert-bg py-3 text-sm leading-[1.57] text-alert-fg"
    >
      <div className="du-container flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="flex-[1_1_36rem]">
          <strong>Versão de teste</strong> · Requer <strong>Minecraft Bedrock 26.52</strong> com os experimentos <strong>Beta APIs</strong> e{" "}
          <strong>Próximos recursos do criador</strong> ativados · <strong>Faça backup do seu mundo</strong>
        </p>
        <Link
          href="/instalar#requisitos"
          className="inline-flex min-h-12 items-center font-semibold text-alert-fg underline underline-offset-4"
        >
          Ver requisitos
        </Link>
      </div>
    </aside>
  );
}
