export type ResultadoValidacaoSenha = {
    senha: boolean
    confirmarSenha: boolean
    confirmarSenhaAtual: boolean
};

export function validarSenhas(
    senha: unknown,
    confirmarSenha: unknown,
    edicao: boolean,
    confirmarSenhaAtual?: unknown,
): ResultadoValidacaoSenha {
    // SENHA
    const senhaValida =
        typeof senha === "string" &&
        senha.length >= 8 &&
        senha.length <= 255 &&
        /\W/.test(senha) &&
        /\d/.test(senha) &&
        /[a-zA-Z]/.test(senha);

    // CONFIRMAR SENHA
    const confirmarSenhaValida =
        senha === confirmarSenha
        && senhaValida

    // CONFIRMAR SENHA ANTIGA
    const senhaAntigaValida =
        !edicao ||
        (edicao &&
            senha === undefined &&
            confirmarSenha === undefined
        ) || (
            typeof confirmarSenhaAtual === "string" &&
            confirmarSenhaAtual.length >= 8 &&
            confirmarSenhaAtual.length <= 255
        );

    return {
        senha: senhaValida,
        confirmarSenha: confirmarSenhaValida,
        confirmarSenhaAtual: senhaAntigaValida,
    };
}
