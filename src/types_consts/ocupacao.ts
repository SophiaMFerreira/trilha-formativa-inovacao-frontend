export type OcupacaoDTO = {
    id?: number
    titulo: string
}

enum Ocupacao {
  ESTUDANTE_NIVEL_TECNICO = "estudante de nível técnico",
  ESTUDANTE_GRADUACAO = "estudante de graduação",
  ESTUDANTE_PROEJA = "estudante de proeja",
  SERVIDOR_PUBLICO = "servidor público",
  FUNCIONARIO_NITEC = "funcionário do nittec",
  FUNCIONARIO_TERCEIRIZADO = "funcionário terceirizado",
  PROFESSOR = "professor",
  COMUNIDADE_EXTERNA = "comunidade externa",
  OUTRO = "outro",
}

const ocupacaoLabel = {
  [Ocupacao.ESTUDANTE_NIVEL_TECNICO]: "Estudante de Nível Técnico",
  [Ocupacao.ESTUDANTE_GRADUACAO]: "Estudante de Graduação",
  [Ocupacao.ESTUDANTE_PROEJA]: "Estudante de PROEJA",
  [Ocupacao.SERVIDOR_PUBLICO]: "Servidor Público",
  [Ocupacao.FUNCIONARIO_NITEC]: "Funcionário do NITTEC",
  [Ocupacao.FUNCIONARIO_TERCEIRIZADO]: "Funcionário Terceirizado",
  [Ocupacao.PROFESSOR]: "Professor",
  [Ocupacao.COMUNIDADE_EXTERNA]: "Comunidade Externa",
  [Ocupacao.OUTRO]: "Outro",
} as const;

export function obterNomeOcupacao(titulo: string) {
  return ocupacaoLabel[titulo as keyof typeof ocupacaoLabel] ?? "";
}