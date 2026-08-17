import { UsuarioDTO } from "./usuario"

export type DistintivoDTO = {
    id: number
    titulo: string
    pontuacao: number
    nomeArquivo: string
}

export type DistintivoAdquiridoDTO = {
    idUsuario: number
    idDistintivo: number
}

export type DistintivoAdquirido = {
    usuario: UsuarioDTO
    distintivo: DistintivoDTO
}

export type Distintivo = DistintivoDTO & {
    adquirido: boolean;
};