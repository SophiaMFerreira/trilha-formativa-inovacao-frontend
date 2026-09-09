import { OcupacaoDTO } from "./ocupacao";

export type AvatarUsuarioProps = {
  imagem?: string;
  onChange: (file: File, preview: string) => void;
};

export type UsuarioDTO = SenhasDTO & {
    nomeUsuario: string
    nomeAventureiro: string
    correioEletronico: string
    dataNascimento: string
    possuiConhecimento: boolean
    primeiroAcesso: boolean
    idOcupacao: number
}

type SenhasDTO = 
    SenhaDTO |
    SenhaAtualizarDTO

type SenhaDTO = {
    senha: string
    senhaRepeticao: string
}

type SenhaAtualizarDTO = {
    novaSenha: string
    novaSenhaRepeticao: string,
    senhaAtual: string
}

export type Usuario = {
    id: number
    nomeUsuario: string
    nomeAventureiro: string
    correioEletronico: string
    dataNascimento: string
    possuiConhecimento: boolean
    primeiroAcesso: boolean
    /*
     * A coluna FotoPerfil é NOT NULL, então "sem foto" chega da API
     * como string vazia; a remoção devolve null. Os três casos
     * significam a mesma coisa e urlDaFotoDePerfil trata todos.
     */
    fotoPerfil?: string | null
    ocupacao: OcupacaoDTO
}

export type Login = {
    email: string
    senha: string
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