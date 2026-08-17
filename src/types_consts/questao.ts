import { Alternativa } from "./alternativa";

export type QuestaoDTO = {
  enunciado: string
  mensagemCorrecao: string
}

export type QuestaoProp = {
  id: number
  enunciado: string
  mensagemCorrecao: string
  alternativas: Alternativa[]
  idMissao: number
  correta: boolean
}