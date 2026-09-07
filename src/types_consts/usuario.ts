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
    fotoPerfil?: string
    ocupacao: OcupacaoDTO
}

export type Login = {
    email: string
    senha: string
}