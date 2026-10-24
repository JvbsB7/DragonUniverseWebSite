"use client";

import { Menu } from "lucide-react";
import { useMenu } from "@/store/menu";

// Botão "Abrir menu" do cabeçalho (some a partir de 1100 px, onde a navegação aparece inteira).
export function MenuTrigger() {
  const open = useMenu((s) => s.open);
  const arm = useMenu((s) => s.arm);
  const openFrom = useMenu((s) => s.openFrom);
  return (
    <button
      type="button"
      aria-label="Abrir menu"
      aria-haspopup="dialog"
      aria-expanded={open}
      onPointerDown={arm}
      onFocus={arm}
      onClick={(e) => openFrom(e.currentTarget)}
      className="inline-flex size-12 shrink-0 items-center justify-center border-2 border-border bg-surface text-text hover:bg-raised nav:hidden"
    >
      <Menu aria-hidden="true" className="size-5" />
    </button>
  );
}
