export type TematicaDTO = {
    id: number
    titulo: string
}

export enum Tematica {
  LEGISLACAO = "legislação",
  TRANFERENCIA_TECNOLOGICA = "transferência tecnológica",
  PROPRIEDADE_INTELECTUAL = "propriedade intelectual",
  AMBIENTES_INOVACAO = "ambientes de inovação",
  TAREFA_FINAL = "tarefa final"
}

export const tematicaLabel = {
  [Tematica.LEGISLACAO]: "Legislação",
  [Tematica.TRANFERENCIA_TECNOLOGICA]: "Transferência Tecnológica",
  [Tematica.PROPRIEDADE_INTELECTUAL]: "Propriedade Intelectual",
  [Tematica.AMBIENTES_INOVACAO]: "Ambientes de Inovação",
  [Tematica.TAREFA_FINAL]: "Tarefa Final",
} as const;

export enum TematicaRota {
  LEGISLACAO = "legislacao",
  TRANFERENCIA_TECNOLOGICA = "transferenciaTecnologica",
  PROPRIEDADE_INTELECTUAL = "propriedadeIntelectual",
  AMBIENTES_INOVACAO = "ambientesInovacao",
  //TAREFA_FINAL = "tarefaFinal"
}

export const tematicaRotaLabel = {
  [TematicaRota.LEGISLACAO]: "Legislação",
  [TematicaRota.TRANFERENCIA_TECNOLOGICA]: "Transferência Tecnológica",
  [TematicaRota.PROPRIEDADE_INTELECTUAL]: "Propriedade Intelectual",
  [TematicaRota.AMBIENTES_INOVACAO]: "Ambientes de Inovação",
  //[TematicaRota.TAREFA_FINAL]: "Tarefa Final",
} as const;

export function obterNomeTematica(titulo: string) {
  return tematicaLabel[titulo as keyof typeof tematicaLabel] ?? "";
}

export function obterNomeTematicaRota(titulo: string) {
  return tematicaRotaLabel[titulo as keyof typeof tematicaRotaLabel] ?? "";
}

export function obterNomeTematicaBanco(titulo: string) {
  return tematicaRotaLabel[titulo as keyof typeof tematicaRotaLabel]?.toLocaleLowerCase() ?? ""
}
/**
 * Parâmetro de rota da trilha, a partir do parâmetro de rota OU do
 * título gravado no banco.
 *
 * `obterNomeTematicaRota` só aceitava o parâmetro de rota; faltava o
 * caminho inverso, necessário para as telas que trabalham com o título
 * vindo da API.
 */
export function obterRotaTematica(trilha: string): TematicaRota | undefined {
  const valor = trilha?.trim().toLocaleLowerCase();

  if (!valor) return undefined;

  const porRota = Object.values(TematicaRota).find(
    rota => rota.toLocaleLowerCase() === valor
  );

  if (porRota) return porRota;

  const porTitulo = (
    Object.entries(tematicaRotaLabel) as [TematicaRota, string][]
  ).find(([, label]) => label.toLocaleLowerCase() === valor);

  return porTitulo?.[0];
}
