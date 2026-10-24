// Planos de apoio (copy §10, brief §6). Proposta interna: nada aparece no site até o time aprovar.
// Para ligar: preencher `tiers` com os dados aprovados e trocar `plansApproved` para true.
// Não há mudança de código de componente. Nomes de nível da proposta interna ficam fora deste arquivo.
export type Tier = {
  name: string;
  price: string;
  benefits: string[];
  url: string;
};

export const plans = {
  plansApproved: false,
  tiers: [] as Tier[],
};
