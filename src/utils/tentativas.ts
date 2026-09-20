import { TipoAtividade } from "@/types_consts/missao";

/** Tentativas permitidas em um quiz ou em uma tarefa de trilha. */
export const TENTATIVAS_PADRAO = 3;
/** A tarefa final vale uma única tentativa. */
export const TENTATIVAS_TAREFA_FINAL = 1;

export function limiteDeTentativas(
    tipoAtividade: TipoAtividade | undefined
): number {
    return tipoAtividade === TipoAtividade.TAREFA_FINAL
        ? TENTATIVAS_TAREFA_FINAL
        : TENTATIVAS_PADRAO;
}

/** Verdadeiro quando não resta tentativa para esta atividade. */
export function esgotouTentativas(
    tentativasRealizadas: number,
    tipoAtividade: TipoAtividade | undefined
): boolean {
    return tentativasRealizadas >= limiteDeTentativas(tipoAtividade);
}
/** Contador exibido no cabeçalho do card: "02/03". */
export function formatarTentativas(
    tentativasRealizadas: number,
    tipoAtividade: TipoAtividade | undefined
): string {
    const limite = limiteDeTentativas(tipoAtividade);
    const realizadas = Math.min(Math.max(tentativasRealizadas, 0), limite);

    const formatar = (valor: number) => String(valor).padStart(2, "0");

    return `${formatar(realizadas)}/${formatar(limite)}`;
}
