import { Alternativa, AlternativaAssociacao, AlternativaMultiplaEscolha, AlternativaOrdenacao, SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";

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

                const associada = alternativa.alternativaAssociada;

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

                // Não pode associar a alternativa com ela mesma
                if (associada.id === alternativa.id) {
                    return false;
                }

                if (
                    !("texto" in associada) ||
                    typeof associada.texto !== "string" ||
                    associada.texto.trim().length === 0 ||
                    associada.texto.trim().length > 255  ||
                    associada.texto.trim() === "Conteúdo da alternativa associada"
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

    const alternativasOrdenacao = alternativas.filter(
        (alternativa) =>
            typeof alternativa === "object" &&
            alternativa !== null &&
            "tipoAlternativa" in alternativa &&
            alternativa.tipoAlternativa ===
            TipoAlternativa.ORDENACAO
    ) as AlternativaOrdenacao[]

    if (alternativasOrdenacao.length > 0) {
        const sequencias = alternativasOrdenacao.map(
            (alternativa) => {
                if (
                    typeof alternativa === "object" &&
                    alternativa !== null &&
                    "numeroSequencia" in alternativa &&
                    typeof alternativa.numeroSequencia === "number"
                ) {
                    return alternativa.numeroSequencia;
                }

                return -1;
            }
        );

        const sequenciasUnicas = new Set(sequencias);

        if (
            sequenciasUnicas.size !== sequencias.length
        ) {
            return false;
        }

        const sequenciasOrdenadas = [...sequencias].sort(
            (a, b) => a - b
        );

        const sequenciaCompleta = sequenciasOrdenadas.every(
            (sequencia, index) =>
                sequencia === index + 1
        );

        if (!sequenciaCompleta) {
            return false;
        }
    }

    const alternativasMultiplaEscolha = alternativas.filter(
        (alternativa) =>
            typeof alternativa === "object" &&
            alternativa !== null &&
            "tipoAlternativa" in alternativa &&
            alternativa.tipoAlternativa ===
            TipoAlternativa.MULTIPLA_ESCOLHA
    ) as AlternativaMultiplaEscolha[]

    if (alternativasMultiplaEscolha.length > 0) {
        const porSubtipo = new Map<
            SubtipoAlternativa,
            typeof alternativasMultiplaEscolha
        >();

        for (const alternativa of alternativasMultiplaEscolha) {
            if (
                !("subtipo" in alternativa) ||
                typeof alternativa.subtipo !== "string" ||
                !Object.values(SubtipoAlternativa).includes(
                    alternativa.subtipo as SubtipoAlternativa
                )
            ) {
                return false;
            }

            const subtipo =
                alternativa.subtipo as SubtipoAlternativa;

            const grupo =
                porSubtipo.get(subtipo) ?? [];

            grupo.push(alternativa);

            porSubtipo.set(subtipo, grupo);
        }

        for (const [subtipo, grupo] of porSubtipo) {
            const quantidadeCorretas = grupo.filter(
                (alternativa) =>
                    "correta" in alternativa &&
                    alternativa.correta === true
            ).length;

            if (quantidadeCorretas < 1) {
                return false;
            }

            if (
                subtipo ===
                SubtipoAlternativa.MULTIPLA_ESCOLHA &&
                quantidadeCorretas !== 1
            ) {
                return false;
            }

            if (
                subtipo ===
                SubtipoAlternativa.VERDADEIRO_FALSO &&
                quantidadeCorretas !== 1
            ) {
                return false;
            }

            if (
                subtipo ===
                SubtipoAlternativa.MULTIPLAS_CORRETAS &&
                quantidadeCorretas < 1
            ) {
                return false;
            }
        }
    }

    return true && alternativasValidas
}