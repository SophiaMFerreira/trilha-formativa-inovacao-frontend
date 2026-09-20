import { Missao, MissaoAtividade, TipoAtividade } from "@/types_consts/missao";

export type SituacaoTarefaDaTematica = {
    /** A temática já tem uma missão de tarefa cadastrada. */
    jaPossuiTarefa: boolean
    /** Título da tarefa que já ocupa a temática, quando existe. */
    tituloDaTarefa?: string
    /** O tipo escolhido agora é uma tarefa. */
    ehTarefa: boolean
    /** Verdadeiro quando salvar criaria uma segunda tarefa na temática. */
    duplicaria: boolean
};

/** Quiz é o único tipo que pode se repetir dentro de uma temática. */
export function ehTipoTarefa(
    tipoAtividade: TipoAtividade | string | undefined
): boolean {
    return tipoAtividade === TipoAtividade.TAREFA
        || tipoAtividade === TipoAtividade.TAREFA_FINAL;
}

/**
 * Verifica se a temática já tem uma missão de tarefa.
 *
 * A tarefa é a missão final da temática: é ela que concede o
 * distintivo da trilha e é nela que o bloqueio de progresso
 * (utils/bloqueioTarefa) se apoia. Toda essa lógica procura UMA
 * tarefa por temática — `missoes.find(...)` — então uma segunda
 * tarefa cadastrada passaria despercebida para o aventureiro, que
 * nunca a veria liberada, e disputaria o mesmo lugar de "última
 * missão" no mapa.
 *
 * Quiz e conteúdo não entram nessa conta: podem se repetir à vontade
 * dentro do limite de posições do mapa (utils/limiteDeMissoes).
 *
 * @param idMissaoEmEdicao Missão sendo editada; ela é a própria
 * tarefa da temática e por isso não conta contra o limite.
 */
export function avaliarTarefaDaTematica(
    missoes: Missao[] | null | undefined,
    tituloTematica: string,
    tipoAtividadeEscolhido: TipoAtividade | string | undefined,
    idMissaoEmEdicao?: number
): SituacaoTarefaDaTematica {
    const tarefaExistente = (missoes ?? []).find(missao => {
        if (missao?.tematica?.titulo !== tituloTematica) return false;

        if (idMissaoEmEdicao !== undefined && missao.id === idMissaoEmEdicao) {
            return false;
        }

        if (!("tipoAtividade" in missao)) return false;

        return ehTipoTarefa((missao as MissaoAtividade).tipoAtividade);
    });

    const ehTarefa = ehTipoTarefa(tipoAtividadeEscolhido);

    return {
        jaPossuiTarefa: tarefaExistente !== undefined,
        tituloDaTarefa: tarefaExistente?.titulo,
        ehTarefa,
        duplicaria: ehTarefa && tarefaExistente !== undefined,
    };
}
