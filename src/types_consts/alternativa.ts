import { Usuario } from "./usuario";

// -------------------= Enum e Labels =--------------------

export enum TipoAlternativa {
  MULTIPLA_ESCOLHA = "multipla_escolha",
  ORDENACAO = "ordenacao",
  ASSOCIACAO = "associacao",
}

export enum SubtipoAlternativa {
  MULTIPLA_ESCOLHA = "multipla_escolha",
  VERDADEIRO_FALSO = "verdadeiro_falso",
  MULTIPLAS_CORRETAS = "multipla_correta",
}

export const TipoAlternativaLabel = {
  [TipoAlternativa.MULTIPLA_ESCOLHA]: "Múltipla escolha",
  [TipoAlternativa.ASSOCIACAO]: "Associação",
  [TipoAlternativa.ORDENACAO]: "Ordenação"
}

export const SubtipoAlternativaLabel = {
  [SubtipoAlternativa.MULTIPLA_ESCOLHA]: "Múltipla escolha",
  [SubtipoAlternativa.VERDADEIRO_FALSO]: "Verdadeiro ou falso",
  [SubtipoAlternativa.MULTIPLAS_CORRETAS]: "Múltiplas corretas",
}

// -------------------= type de recebimento da API =--------------------

export type AlternativaDTO =
    | AlternativaAssociacaoDTO
    | AlternativaMultiplaEscolhaDTO
    | AlternativaOrdenacaoDTO

export type AlternativaAssociadaDTO =
    | AlternativaAssociadaPostDTO
    | AlternativaAssociadaPutDTO

type AlternativaBaseDTO = {
    id?: number;
    texto: string;
};

export type AlternativaMultiplaEscolhaDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA
    correta: boolean
    subtipo: string
}

/**
 * Alternativa associada em uma CRIAÇÃO.
 *
 * Não leva ID: o par ainda não existe no banco e é o backend quem o
 * cria (AlternativaDAO::salvarEspecializacao) antes de gravar o
 * vínculo em ALTERNATIVA_ASSOCIACAO.
 */
export type AlternativaAssociadaPostDTO = {
    texto: string
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
}

/**
 * Alternativa associada em uma EDIÇÃO.
 *
 * Leva o ID da associada já existente, para que o backend atualize o
 * par em vez de criar outro. O backend aceita tanto
 * `idAlternativaAssociada` quanto `id`.
 */
export type AlternativaAssociadaPutDTO = {
    idAlternativaAssociada: number
    texto: string
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
}

export type AlternativaAssociacaoDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
    alternativaAssociada: AlternativaAssociadaDTO
}

export type AlternativaOrdenacaoDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.ORDENACAO
    numeroSequencia: number
}

/**
 * Resposta do POST de alternativa (HTTP 201), com os IDs gerados —
 * inclusive o da alternativa associada.
 */
export type RetornoSalvarAlternativa = {
    mensagem: string
    alternativas: AlternativaSalvaDTO[]
}

export type AlternativaSalvaDTO = {
    id: number
    texto: string
    tipoAlternativa: TipoAlternativa
    idQuestao?: number
    numeroSequencia?: number
    correta?: boolean
    subtipo?: string
    alternativaAssociada?: {
        id: number
        texto: string
        tipoAlternativa: TipoAlternativa.ASSOCIACAO
    }
}
  
// Alternativa marcada

export type AlternativaMarcadaDTO = 
    | AlternativaMarcadaMultiplaEscolhaDTO
    | AlternativaMarcadaAssociacaoDTO
    | AlternativaMarcadaOrdenacaoDTO

export type AlternativaMarcadaMultiplaEscolhaDTO = {
    idUsuario: number
    idAlternativa: number
}

export type AlternativaMarcadaAssociacaoDTO = AlternativaMarcadaMultiplaEscolhaDTO & {
    idAlternativaAssociadaRespondida : number
}

export type AlternativaMarcadaOrdenacaoDTO = AlternativaMarcadaMultiplaEscolhaDTO & {
    sequenciaRespondida: number
}

// -------------------= Geral =--------------------

export type AlternativaProps = {
  texto: string
  estilo: any
  minH?: boolean
}

export type Alternativa =
    | AlternativaAssociacao
    | AlternativaMultiplaEscolha
    | AlternativaAssocida
    | AlternativaOrdenacao

type AlternativaBase = {
    id: number;
    texto: string;
    correta?: boolean
};

export type AlternativaAssocida = AlternativaBase & {
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
}

export type AlternativaAssociacao = AlternativaBase & {
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
    alternativaAssociada: AlternativaAssocida
}

// Alternativa marcada

type AlternativaMarcadaAtributo = Alternativa & {
    idQuestao: number;
};

export type AlternativaMarcada = {
    usuario: Usuario
    alternativa: AlternativaMarcadaAtributo
    correta: boolean
}

export type AlternativaMultiplaEscolha = AlternativaBase & {
    tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA
    correta: boolean
    subtipo: SubtipoAlternativa
}

export type AlternativaOrdenacao = AlternativaBase & {
    tipoAlternativa: TipoAlternativa.ORDENACAO
    numeroSequencia: number
}