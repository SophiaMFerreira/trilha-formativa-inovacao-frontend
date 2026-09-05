export function validarCodigoRecuperacao(
    tempo: unknown,
    codigo: unknown
): boolean {
    // TEMPO
    const tempoValido =
        typeof tempo === "number" &&
        tempo > 0

    // CODIGO
    const codigoValido =
        typeof codigo === "string" &&
        codigo.trim().length === 9

    return tempoValido && codigoValido
}
