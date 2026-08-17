export type TematicaDTO = {
    id: number
    titulo: string
}

export enum Tematica {
  LEGISLACAO = "legislação",
  TRANFERENCIA_TECNOLOGICA = "transferência tecnológica",
  PROPRIEDADE_INTELECTUAL = "propriedade intelectual",
  AMBIENTES_INOVACAO = "ambientes de inovação",
}

export const tematicaLabel = {
  [Tematica.LEGISLACAO]: "Legislação",
  [Tematica.TRANFERENCIA_TECNOLOGICA]: "Transferência Tecnológica",
  [Tematica.PROPRIEDADE_INTELECTUAL]: "Propriedade Intelectual",
  [Tematica.AMBIENTES_INOVACAO]: "Ambientes de Inovação",
} as const;

export enum TematicaRota {
  LEGISLACAO = "legislacao",
  TRANFERENCIA_TECNOLOGICA = "transferenciaTecnologica",
  PROPRIEDADE_INTELECTUAL = "propriedadeIntelectual",
  AMBIENTES_INOVACAO = "ambientesInovacao",
}

export const tematicaRotaLabel = {
  [TematicaRota.LEGISLACAO]: "Legislação",
  [TematicaRota.TRANFERENCIA_TECNOLOGICA]: "Transferência Tecnológica",
  [TematicaRota.PROPRIEDADE_INTELECTUAL]: "Propriedade Intelectual",
  [TematicaRota.AMBIENTES_INOVACAO]: "Ambientes de Inovação",
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