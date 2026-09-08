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