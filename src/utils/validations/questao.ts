import { SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";
import { TipoAtividade } from "@/types_consts/missao";
import { validarAlternativas } from "./alternativa";

type ValidarQuestaoParams = {
    idQuestao: unknown;
    enunciado: unknown;
    mensagemCorrecao: unknown;
    tipoAlternativa: unknown;
    tematica: unknown;
    idAtividade: unknown;
    tipoAtividade: unknown;
    alternativas: unknown[];
    dadosAtuais: DadosAtuaisProps;
    edicao: boolean
}

export type DadosAtuaisProps = {
    tematica: string;
    idAtividade: number,
    tipoAtividade: string,
    tipoAlternativa: string
};

type ResultadoValidacaoQuestao = {
    valido: boolean;

    idQuestao: boolean;
    enunciado: boolean;
    mensagemCorrecao: boolean;
    tipoAlternativa: boolean;
    tipoAlternativaMantida: boolean;
    trilha: boolean;
    trilhaMantida: boolean;
    idAtividade: boolean;
    tipoAtividade: boolean;
    idAtividadeMantido: boolean;
    tipoAtividadeMantido: boolean;
    alternativas: boolean;
};

export function validarQuestao({
    idQuestao,
    enunciado,
    mensagemCorrecao,
    tematica,
    tipoAlternativa,
    idAtividade,
    tipoAtividade,
    alternativas,
    dadosAtuais,
    edicao
}: ValidarQuestaoParams): ResultadoValidacaoQuestao {

    // ID DA QUESTÃO
    const idQuestaoValido =
        !edicao || (
            typeof idQuestao === "number" &&
            Number.isInteger(idQuestao) &&
            (idQuestao > 0)
        );

    // ENUNCIADO    
    const enunciadoValido =
        typeof enunciado === "string" &&
        enunciado.trim().length > 0 &&
        enunciado.trim().length <= 255

    // MENSAGEM CORREÇÃO   
    const mensagemCorrecaoValida =
        typeof mensagemCorrecao === "string" &&
        mensagemCorrecao.trim().length > 0 &&
        mensagemCorrecao.trim().length <= 255;

    // TEMÁTICA
    const tematicaValida =
        typeof tematica === "string" &&
        tematica.trim().length > 0 &&
        tematica.trim().length <= 255

    // INALTERACAO DE TEMATICA
    const tematicaMantida =
        !edicao || tematica === dadosAtuais.tematica

    // TIPO ATIVIDADE
    const tipoAtividadeValido =
        typeof tipoAtividade === "string" &&
        Object.values(TipoAtividade).includes(tipoAtividade as TipoAtividade)

    // INALTERACAO DE TIPO ATIVIDADE
    const tipoAtividadeMantido =
        !edicao || tipoAtividade === dadosAtuais.tipoAtividade
    
    // ID DA MISSÃO
    const idAtividadeValido =
            typeof idAtividade === "number" &&
            Number.isInteger(idAtividade) &&
            (idAtividade > 0)

    // INALTERACAO DE ATIVIDADE
    const idAtividadeMantido =
        !edicao || idAtividade === dadosAtuais.idAtividade

    // TIPO ALTERNATIVA
    const tipoAlternativaValida =
        typeof tipoAlternativa === "string" &&
        (
            Object.values(TipoAlternativa).includes(tipoAlternativa as TipoAlternativa) ||
            Object.values(SubtipoAlternativa).includes(tipoAlternativa as SubtipoAlternativa)
        );

    // INALTERACAO DE TIPO ALTERNATIVA
    const tipoAlternativaMantido =
        !edicao || tipoAlternativa === dadosAtuais.tipoAlternativa

    // ALTERNATIVAS
    const alternativasValidas = validarAlternativas({alternativas, edicao})

    // RESULTADO FINAL
    const valido = !(
        idQuestaoValido &&
        enunciadoValido &&
        mensagemCorrecaoValida &&
        tipoAlternativaValida &&
        tipoAlternativaMantido &&
        tematicaValida &&
        tematicaMantida &&
        idAtividadeValido &&
        idAtividadeValido &&
        idAtividadeMantido &&
        alternativasValidas
    );

    return {
        valido,

        idQuestao: idQuestaoValido,
        enunciado: !enunciadoValido,
        mensagemCorrecao: !mensagemCorrecaoValida,
        tipoAlternativa: !tipoAlternativaValida,
        tipoAlternativaMantida: !tipoAlternativaMantido,
        trilha: !tematicaValida,
        trilhaMantida: !tematicaMantida,
        idAtividade: !idAtividadeValido,
        tipoAtividade: !tipoAtividadeValido,
        tipoAtividadeMantido: !tipoAtividadeMantido,
        idAtividadeMantido: !idAtividadeMantido,
        alternativas: !alternativasValidas,
    };
}