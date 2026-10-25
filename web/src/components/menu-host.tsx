"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { menuReturnFocus, useMenu } from "@/store/menu";

// O diálogo do menu (Base UI) só é baixado quando a pessoa toca ou foca o acionador, fora do JS de primeira carga.
const MenuSheet = dynamic(() => import("./menu-sheet"), { ssr: false });

export function MenuHost() {
  const armed = useMenu((s) => s.armed);
  const open = useMenu((s) => s.open);
  const setOpen = useMenu((s) => s.setOpen);

  // A partir do breakpoint da navegação completa o menu em tela cheia não existe mais.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 68.75rem)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setOpen]);

  if (!armed) return null;
  return <MenuSheet open={open} onOpenChange={setOpen} returnFocusTo={menuReturnFocus} />;
}
