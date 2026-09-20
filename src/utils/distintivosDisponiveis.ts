import { DistintivoDTO } from "@/types_consts/distintivo";
import { Missao, MissaoTarefa, TipoAtividade } from "@/types_consts/missao";

export const TITULO_TROFEU_FINAL = "Troféu Final";

export type SituacaoDistintivos = {
    /** Distintivos que a missão em edição pode receber. */
    disponiveis: DistintivoDTO[]
    /** Quantos foram ocultados por já pertencerem a outra tarefa. */
    emUso: number
    /** O troféu final foi ocultado por não ser uma tarefa final. */
    trofeuReservado: boolean
};

export function ehTrofeuFinal(distintivo: { titulo: string }): boolean {
    return distintivo.titulo.trim().toLowerCase()
        === TITULO_TROFEU_FINAL.toLowerCase();
}

/**
 * Distintivos que ainda podem ser vinculados a uma tarefa.
 *
 * Duas regras: um distintivo pertence a uma tarefa só, e o troféu
 * final é exclusivo da missão do tipo tarefa final.
 */
export function avaliarDistintivosDisponiveis(
    distintivos: DistintivoDTO[],
    missoes: Missao[] | null | undefined,
    tipoAtividade: TipoAtividade | string | undefined,
    idMissaoEmEdicao?: number
): SituacaoDistintivos {
    const ocupados = new Set<number>();

    for (const missao of missoes ?? []) {
        if (idMissaoEmEdicao !== undefined && missao.id === idMissaoEmEdicao) {
            continue;
        }

        const idDistintivo = (missao as MissaoTarefa)?.distintivo?.id;

        if (idDistintivo !== undefined) {
            ocupados.add(idDistintivo);
        }
    }

    const ehTarefaFinal = tipoAtividade === TipoAtividade.TAREFA_FINAL;

    let emUso = 0;
    let trofeuReservado = false;

    const disponiveis = distintivos.filter(distintivo => {
        if (ocupados.has(distintivo.id)) {
            emUso++;
            return false;
        }

        if (ehTrofeuFinal(distintivo) && !ehTarefaFinal) {
            trofeuReservado = true;
            return false;
        }

        return true;
    });

    return { disponiveis, emUso, trofeuReservado };
}
