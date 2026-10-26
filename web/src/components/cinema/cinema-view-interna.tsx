"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import type { ReactNode } from "react";

// Região do canvas cinema ligada a um elemento do DOM. Câmera ortográfica (padrão): 1 unidade = 1 px de skin e `zoom` = px por unidade.
// Com `propria`, a cena traz a câmera dela (batalha em perspectiva).
export default function CinemaViewInterna({ zoom, centroY, propria, children }: { zoom: number; centroY: number; propria: boolean; children: ReactNode }) {
  return (
    <View className="pointer-events-none absolute inset-0">
      {!propria && <OrthographicCamera makeDefault position={[0, centroY, 200]} zoom={zoom} near={1} far={500} />}
      {children}
    </View>
  );
}
