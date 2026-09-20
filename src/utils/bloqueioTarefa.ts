import {
    Missao,
    MissaoAtividade,
    ProgressoMissao,
    ProgressoMissaoAtividade,
    TipoAtividade,
} from "@/types_consts/missao";

import { esgotouTentativas } from "@/utils/tentativas";

export type SituacaoTarefaDaTrilha = {
    /** A trilha possui uma missão do tipo tarefa. */
    possuiTarefa: boolean
    /** Id da tarefa da trilha, quando existe. */
    idTarefa?: number
    /** Conteúdos e quizzes que precedem a tarefa. */
    totalPreRequisitos: number
    /** Pré-requisitos já finalizados. */
    finalizados: number
    /** Conteúdos ainda não consumidos. */
    conteudosPendentes: number
    /** Quizzes ainda não finalizados. */
    quizzesPendentes: number
    /** Verdadeiro quando a tarefa pode ser aberta. */
    liberada: boolean
};

/**
 * Uma missão conta como finalizada quando chegou a 100% OU quando as
 * tentativas acabaram.
 *
 * O segundo caso é o que impede um bloqueio permanente: um quiz
 * encerrado com 60% depois das três tentativas nunca mais sobe, e
 * exigir 100% deixaria a tarefa inalcançável para sempre. Conteúdo
 * não tem tentativa, então para ele só vale o progresso.
 */
export function missaoFinalizada(progresso: ProgressoMissao): boolean {
    if (Number(progresso.progresso) >= 100) return true;

    const missao = progresso.missao;

    if (!("tipoAtividade" in missao)) return false;

    if (!("tentativasRealizadas" in progresso)) return false;

    const atividade = progresso as ProgressoMissaoAtividade;

    return esgotouTentativas(
        atividade.tentativasRealizadas,
        (missao as MissaoAtividade).tipoAtividade
    );
}

/**
 * Decide se a tarefa da trilha já pode ser aberta.
 *
 * A ordem desenhada no mapa (components/commons/mapaRegional) coloca
 * a tarefa sempre no fim: ela é a última missão da temática. A regra
 * de negócio acompanha o desenho — o aventureiro só chega nela depois
 * de percorrer todos os conteúdos e quizzes daquela temática.
 *
 * Missões sem progresso registrado contam como pendentes: o
 * GameProvider cria o progresso de todas as missões no primeiro
 * acesso, então a ausência do registro significa "ainda não começou",
 * e não "não se aplica".
 */
export function avaliarLiberacaoDaTarefa(
    missoesDaTrilha: Missao[] | null | undefined,
    progressoMissoes: ProgressoMissao[]
): SituacaoTarefaDaTrilha {
    const missoes = missoesDaTrilha ?? [];

    const tarefa = missoes.find(missao =>
        "tipoAtividade" in missao
        && missao.tipoAtividade === TipoAtividade.TAREFA
    );

    const progressoPorMissao = new Map(
        progressoMissoes
            .filter(p => p?.missao?.id !== undefined)
            .map(p => [p.missao.id, p])
    );

    let conteudosPendentes = 0;
    let quizzesPendentes = 0;
    let totalPreRequisitos = 0;
    let finalizados = 0;

    for (const missao of missoes) {
        const ehConteudo = "tipoMaterial" in missao;

        const ehQuiz = "tipoAtividade" in missao
            && missao.tipoAtividade === TipoAtividade.QUIZ;

        if (!ehConteudo && !ehQuiz) continue;

        totalPreRequisitos++;

        const progresso = progressoPorMissao.get(missao.id);

        if (progresso && missaoFinalizada(progresso)) {
            finalizados++;
            continue;
        }

        if (ehConteudo) {
            conteudosPendentes++;
        } else {
            quizzesPendentes++;
        }
    }

    const pendentes = conteudosPendentes + quizzesPendentes;

    return {
        possuiTarefa: tarefa !== undefined,
        idTarefa: tarefa?.id,
        totalPreRequisitos,
        finalizados,
        conteudosPendentes,
        quizzesPendentes,
        liberada: pendentes === 0,
    };
}

/**
 * Frase curta com o que ainda falta, usada no diálogo de bloqueio.
 * Devolve string vazia quando não há pendência.
 */
export function descreverPendencias(
    situacao: SituacaoTarefaDaTrilha
): string {
    const partes: string[] = [];

    if (situacao.conteudosPendentes > 0) {
        partes.push(
            situacao.conteudosPendentes === 1
                ? "1 conteúdo"
                : `${situacao.conteudosPendentes} conteúdos`
        );
    }

    if (situacao.quizzesPendentes > 0) {
        partes.push(
            situacao.quizzesPendentes === 1
                ? "1 quiz"
                : `${situacao.quizzesPendentes} quizzes`
        );
    }

    return partes.join(" e ");
}
