"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import type { ReactNode } from "react";

// Região do canvas cinema ligada a um elemento do DOM. Câmera ortográfica: 1 unidade = 1 px de skin e `zoom` = px por unidade.
export default function CinemaViewInterna({ zoom, centroY, children }: { zoom: number; centroY: number; children: ReactNode }) {
  return (
    <View className="pointer-events-none absolute inset-0">
      <OrthographicCamera makeDefault position={[0, centroY, 200]} zoom={zoom} near={1} far={500} />
      {children}
    </View>
  );
}
