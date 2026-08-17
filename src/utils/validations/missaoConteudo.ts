type ValidarConteudoParams = {
    titulo: unknown;
    pontuacao: unknown;
    idMissaoMaterial: unknown;
    idTrilha: unknown;
    url: unknown;
    resumo: unknown;
    tipoMaterial: unknown;
    edicao: boolean
};

export type ResultadoValidacaoConteudo = {
    valido: boolean;

    idMissaoMaterial: boolean;
    idTrilha: boolean;
    tipoMaterial: boolean;
    titulo: boolean;
    url: boolean;
    resumo: boolean;
    pontuacao: boolean;
};

export function validarConteudo({
    titulo,
    pontuacao,
    idMissaoMaterial,
    idTrilha,
    url,
    resumo,
    tipoMaterial,
    edicao
}: ValidarConteudoParams): ResultadoValidacaoConteudo {

    // ID DA MISSÃO
    const idMissaoMaterialValido =
        !edicao || (
            typeof idMissaoMaterial === "number" &&
            Number.isInteger(idMissaoMaterial) &&
            (idMissaoMaterial > 0)
        );

    // ID DA TEMÁTICA
    const idTrilhaValido =
        typeof idTrilha === "number" &&
        Number.isInteger(idTrilha) &&
        idTrilha > 0;

    // TIPO DO MATERIAL
    const tipoMaterialValido =
        typeof tipoMaterial === "string" &&
        ["texto", "video"].includes(tipoMaterial) &&
        tipoMaterial.trim() !== "";

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

    // URL
    let urlValida = false;

    if (typeof url === "string") {
        const urlLimpa = url.trim();

        if (urlLimpa.length > 0) {
            try {
                const urlObj = new URL(urlLimpa);

                urlValida =
                    (urlObj.protocol === "http:" ||
                        urlObj.protocol === "https:") &&
                    urlObj.hostname.length > 0;
            } catch {
                urlValida = false;
            }
        }
    }

    // RESUMO
    const resumoLimpo =
        typeof resumo === "string"
            ? resumo.trim()
            : "";

    const resumoValido =
        typeof resumo === "string" &&
        resumoLimpo.length > 0 &&
        resumoLimpo.length <= 1000;

    // RESULTADO FINAL
    const valido = !(
        idMissaoMaterialValido &&
        idTrilhaValido &&
        tipoMaterialValido &&
        tituloValido &&
        urlValida &&
        resumoValido &&
        pontuacaoValida);

    return {
        valido,

        idMissaoMaterial: idMissaoMaterialValido,
        idTrilha: idTrilhaValido,
        tipoMaterial: tipoMaterialValido,
        titulo: tituloValido,
        url: urlValida,
        resumo: resumoValido,
        pontuacao: pontuacaoValida,
    };
}