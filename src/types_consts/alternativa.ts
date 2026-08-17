import { QuestaoProp } from "./questao";
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
    | AlternativaAssociacaoPostDTO
    | AlternativaAssociacaoPutDTO
    | AlternativaMultiplaEscolhaDTO
    | AlternativaOrdenacaoDTO

type AlternativaBaseDTO = {
    id?: number;
    texto: string;
};

export type AlternativaMultiplaEscolhaDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA
    correta: boolean
    subtipo: string
}

export type AlternativaAssociadaDTO = AlternativaBaseDTO & {
    texto: string;
    correta: true
}

export type AlternativaAssociacaoPostDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
    alternativaAssociada: AlternativaAssociadaDTO
}

export type AlternativaAssociacaoPutDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.ASSOCIACAO
    alternativaAssociada: AlternativaAssociacao
}

export type AlternativaOrdenacaoDTO = AlternativaBaseDTO & {
    tipoAlternativa: TipoAlternativa.ORDENACAO
    numeroSequencia: number
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
    | AlternativaOrdenacao

type AlternativaBase = {
    id: number;
    texto: string;
    correta?: boolean
};

type AlternativaAssocida = AlternativaBase & {
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