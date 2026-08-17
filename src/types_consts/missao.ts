import { DistintivoDTO } from "./distintivo";
import { QuestaoProp, } from "./questao";
import { TematicaDTO } from "./tematica";
import { Usuario } from "./usuario";

// -------------------= DTO =-------------------

export type MissaoDTO = 
    | MissaoConteudoDTO
    | MissaoAtividadeDTO

type MissaoBaseDTO = {
    titulo: string
    pontuacao: number
    tipoMissao: "conteudo" | "atividade"
    idTematica: number
    id: number
}

export type MissaoConteudoDTO = MissaoBaseDTO & {
    url: string
    resumo: string
    tipoMaterial: "texto" | "video"
}

export type MissaoAtividadeDTO = MissaoBaseDTO & {
    tipoAtividade: TipoAtividade
    idDistintivo?: number
    questoes: number[]
}

// Progresso Missao

export type ProgressoMissaoDTO = 
    | ProgressoMissaoBaseDTO
    | ProgressoMissaoAtividadeDTO

type ProgressoMissaoBaseDTO = {
    idUsuario: number
    idMissao: number
    progresso: number
}

export type ProgressoMissaoAtividadeDTO = ProgressoMissaoBaseDTO & {
    tentativasRealizadas: number
    pontuacaoObtida: number
}

// Missao AtivividadeTarefa

export type MissaoAtividadeTarefaDTO = {
    idMissao: number
    idDistintivo: number
}

// Missao Ativividade ???

export type MissaoAtvddDTO = {
    idMissao: number
    tipoAtividade: TipoAtividade
}

// -------------------= Labels =--------------------

export const tipoMaterialLabel = {
  video: "Vídeo",
  texto: "Texto",
} as const;

export enum TipoAtividade {
  QUIZ = "quiz",
  TAREFA = "tarefa",
  //TAREFA_FINAL = "tarefa final",
}
export const TipoAtividadeLabel = {
  [TipoAtividade.QUIZ]: "Quiz",
  [TipoAtividade.TAREFA]: "Tarefa",
  //[TipoAtividade.TAREFA_FINAL]: "Tarefa Final",
}

// -------------------= Missao =--------------------

export type Missao = 
    | MissaoConteudo
    | MissaoAtividade

export type MissaoAtividade = 
    | MissaoQuiz
    | MissaoTarefa


type MissaoBase = {
    id: number
    titulo: string
    pontuacao: number
    tematica: TematicaDTO
}

export type MissaoConteudo = MissaoBase & {
    url: string
    resumo: string
    tipoMaterial: "texto" | "video"
}

export type MissaoTarefa = MissaoBase & {
    tipoAtividade: TipoAtividade
    distintivo: DistintivoDTO
    questoes: QuestaoProp[]
}

export type MissaoQuiz = MissaoBase & {
    tipoAtividade: TipoAtividade
    questoes: QuestaoProp[]
}

// -------------------= Progresso Missao =--------------------

export type ProgressoMissao = 
    | ProgressoMissaoBase
    | ProgressoMissaoAtividade

type ProgressoMissaoBase = {
    usuario: Usuario
    missao: Missao
    progresso: number
}

export type ProgressoMissaoAtividade = ProgressoMissaoBase & {
    tentativasRealizadas: number
    pontuacaoObtida: number
}