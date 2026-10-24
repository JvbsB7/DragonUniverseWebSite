"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { menuReturnFocus, useMenu } from "@/store/menu";
import { siteConfig } from "@/config/site";

// O Sheet (Base UI) só é baixado quando a pessoa toca ou foca um acionador, fora do JS de primeira carga.
const MenuSheet = dynamic(() => import("./menu-sheet"), { ssr: false });

export function MenuHost() {
  const armed = useMenu((s) => s.armed);
  const open = useMenu((s) => s.open);
  const setOpen = useMenu((s) => s.setOpen);

  // A partir do breakpoint da navegação completa o menu em gaveta não existe mais (§7.4).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 68.75rem)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setOpen]);

  if (!armed) return null;
  return <MenuSheet open={open} onOpenChange={setOpen} items={siteConfig.menu} returnFocusTo={menuReturnFocus} />;
}
