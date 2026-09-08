import { Alternativa } from "./alternativa";

export type QuestaoDTO = {
  enunciado: string
  mensagemCorrecao: string
}

/**
 * Resposta do POST de questão (HTTP 201).
 *
 * `id` é o identificador gerado pelo backend e a fonte oficial para o
 * salvamento das alternativas logo em seguida.
 */
export type RetornoSalvarQuestao = {
  mensagem: string
  id: number
  questao: QuestaoProp
}

export type QuestaoProp = {
  id: number
  enunciado: string
  mensagemCorrecao: string
  alternativas: Alternativa[]
  idMissao: number
  correta: boolean
}