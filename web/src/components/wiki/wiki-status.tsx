import { StatusBadge, type Status } from "@/components/status-badge";
import type { WikiStatus } from "@/lib/wiki-types";

const map: Record<WikiStatus, Status> = {
  "no-jogo": "live",
  "em-desenvolvimento": "dev",
  planejado: "planned",
};

// Selo de status da wiki: "Já no jogo", "Em desenvolvimento" ou "Planejado".
export function WikiStatusBadge({ status }: { status: WikiStatus }) {
  return <StatusBadge status={map[status]} />;
}
