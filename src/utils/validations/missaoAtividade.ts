import { TipoAtividade } from "@/types_consts/missao";

type ValidarAtividadeParams = {
    titulo: unknown;
    pontuacao: unknown;
    idMissaoAtividade: unknown;
    idTrilha: unknown;
    tipoAtividade: unknown;
    idDistintivo: unknown;
    dadosAtuais: DadosAtuaisProps;
    edicao: boolean
}

export type DadosAtuaisProps = {
    idTrilha: number;
    tipoAtividade: TipoAtividade
};

type ResultadoValidacaoAtividade = {
    valido: boolean;

    idMissaoAtividade: boolean;
    idTrilha: boolean;
    trilhaMantida: boolean;
    tipoAtividade: boolean;
    tipoAtividadeMantido: boolean;
    titulo: boolean;
    pontuacao: boolean;
    distintivo: boolean;
};

export function validarAtividade({
    titulo,
    pontuacao,
    idMissaoAtividade,
    idTrilha,
    tipoAtividade,
    idDistintivo,
    dadosAtuais,
    edicao
}: ValidarAtividadeParams): ResultadoValidacaoAtividade {

    // ID DA MISSÃO
    const idMissaoAtividadeValido =
        !edicao || (
            typeof idMissaoAtividade === "number" &&
            Number.isInteger(idMissaoAtividade) &&
            (idMissaoAtividade > 0)
        );
    
    // ID DA TEMÁTICA
    const idTrilhaValido =
        typeof idTrilha === "number" &&
        Number.isInteger(idTrilha) &&
        idTrilha > 0;

    // TIPO ATIVIDADE
    const tipoAtividadeValido =
    typeof tipoAtividade === "string" &&
    Object.values(TipoAtividade).includes(tipoAtividade as TipoAtividade)
        
    // TÍTULO
    const tituloValido =
        typeof titulo === "string" &&
        titulo.trim().length > 0 &&
        titulo.trim().length <= 255;

    // PONTUAÇÃO
    const pontuacaoValida =
        typeof pontuacao === "number" &&
        Number.isFinite(pontuacao) &&
        Number.isInteger(pontuacao) &&
        pontuacao > 0 &&
        pontuacao <= 9999;

    // ID DO DISTINTIVO
    const idDistintivoValido =
        tipoAtividade === TipoAtividade.QUIZ || (
            typeof idDistintivo === "number" &&
            Number.isInteger(idDistintivo) &&
            (idDistintivo > 0)
        );
    
    // INALTERACAO DE TEMATICA
    const tematicaMantida =
        !edicao || idTrilha === dadosAtuais.idTrilha

    // INALTERACAO DE TIPO ATIVIDADE
    const tipoAtividadeMantido =
        !edicao || tipoAtividade === dadosAtuais.tipoAtividade


    // RESULTADO FINAL
    const valido = !(
        idMissaoAtividadeValido &&
        idTrilhaValido &&
        tipoAtividadeValido &&
        tituloValido &&
        pontuacaoValida &&
        idDistintivoValido &&
        tematicaMantida &&
        tipoAtividadeMantido);

    return {
        valido,

        idMissaoAtividade: idMissaoAtividadeValido,
        idTrilha: idTrilhaValido,
        trilhaMantida: tematicaMantida,
        tipoAtividade: tipoAtividadeValido,
        tipoAtividadeMantido: tipoAtividadeMantido,
        titulo: tituloValido,
        pontuacao: pontuacaoValida,
        distintivo: idDistintivoValido
    };
}