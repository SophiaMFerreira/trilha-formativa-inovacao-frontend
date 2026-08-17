import { SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";

type ValidarAlternativasParams = {
    alternativas: unknown[];
    edicao: boolean
}

export function validarAlternativas({ alternativas, edicao }: ValidarAlternativasParams) {
    const alternativasValidas =
    Array.isArray(alternativas) &&
    alternativas.length > 0 &&
    alternativas.every((alternativa) => {

        // Garante que é um objeto válido
        if (
            typeof alternativa !== "object" ||
            alternativa === null
        ) {
            return false;
        }

        // ID
        if (
            !("id" in alternativa) ||
            typeof alternativa.id !== "number" ||
            !Number.isInteger(alternativa.id)
        ) {
            return false;
        }

        if (edicao && alternativa.id <= 0) {
            return false;
        }

        // TEXTO
        if (
            !("texto" in alternativa) ||
            typeof alternativa.texto !== "string" ||
            alternativa.texto.trim().length === 0 ||
            alternativa.texto.trim().length > 255 ||
            alternativa.texto.trim() === "Conteúdo da alternativa" 
        ) {
            return false;
        }

        // TIPO DA ALTERNATIVA
        if (
            !("tipoAlternativa" in alternativa) ||
            typeof alternativa.tipoAlternativa !== "string" ||
            !Object.values(TipoAlternativa).includes(
                alternativa.tipoAlternativa as TipoAlternativa
            )
        ) {
            return false;
        }

        // ASSOCIAÇÃO
        if (
            alternativa.tipoAlternativa ===
            TipoAlternativa.ASSOCIACAO
        ) {
            if (
                !("alternativaAssociada" in alternativa) ||
                typeof alternativa.alternativaAssociada !== "object" ||
                alternativa.alternativaAssociada === null
            ) {
                return false;
            }

            const associada =
                alternativa.alternativaAssociada;

            if (
                !("id" in associada) ||
                typeof associada.id !== "number" ||
                !Number.isInteger(associada.id)
            ) {
                return false;
            }

            if (edicao && associada.id <= 0) {
                return false;
            }

            if (
                !("texto" in associada) ||
                typeof associada.texto !== "string" ||
                associada.texto.trim().length === 0 ||
                associada.texto.trim().length > 255
            ) {
                return false;
            }

            if (
                !("tipoAlternativa" in associada) ||
                associada.tipoAlternativa !==
                TipoAlternativa.ASSOCIACAO
            ) {
                return false;
            }
        }

        // ORDENAÇÃO
        if (
            alternativa.tipoAlternativa ===
            TipoAlternativa.ORDENACAO
        ) {
            if (
                !("numeroSequencia" in alternativa) ||
                typeof alternativa.numeroSequencia !== "number" ||
                !Number.isInteger(alternativa.numeroSequencia) ||
                alternativa.numeroSequencia <= 0
            ) {
                return false;
            }
        }

        // MÚLTIPLA ESCOLHA
        if (
            alternativa.tipoAlternativa ===
            TipoAlternativa.MULTIPLA_ESCOLHA
        ) {
            if (
                !("correta" in alternativa) ||
                typeof alternativa.correta !== "boolean"
            ) {
                return false;
            }

            if (
                !("subtipo" in alternativa) ||
                typeof alternativa.subtipo !== "string" ||
                !Object.values(SubtipoAlternativa).includes(
                    alternativa.subtipo as SubtipoAlternativa
                )
            ) {
                return false;
            }
        }

        return true;
    });
    console.log("func " + alternativasValidas)
    console.log(alternativas)
    
    return alternativasValidas 
}