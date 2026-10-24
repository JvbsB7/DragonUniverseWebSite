import { create } from "zustand";
import type { WikiStatus } from "@/lib/wiki-types";

// Estado da busca e dos filtros da wiki. O conteúdo vem do índice gerado no build, não daqui.
type WikiFilters = {
  query: string;
  category: string | null;
  status: WikiStatus | null;
  setQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setStatus: (status: WikiStatus | null) => void;
  clear: () => void;
};

export const useWikiFilters = create<WikiFilters>((set) => ({
  query: "",
  category: null,
  status: null,
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  clear: () => set({ query: "", category: null, status: null }),
}));
