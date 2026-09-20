export type ResultadoValidacaoSenha = {
    senha: boolean
    confirmarSenha: boolean
    confirmarSenhaAtual: boolean
};

/** Comprimentos aceitos pela política de senha, iguais aos do backend. */
const TAMANHO_MINIMO = 8;
const TAMANHO_MAXIMO = 255;

function preenchido(valor: unknown): boolean {
    return typeof valor === "string" && valor.trim().length > 0;
}
/** Indica que o usuário quer trocar a senha. */
export function informouNovaSenha(senha: unknown, confirmarSenha: unknown): boolean {
    return preenchido(senha) || preenchido(confirmarSenha);
}
/** Valida a senha conforme o momento do fluxo. */
export function validarSenhas(
    senha: unknown,
    confirmarSenha: unknown,
    edicao: boolean,
    confirmarSenhaAtual?: unknown,
): ResultadoValidacaoSenha {
    const desejaAlterarSenha = !edicao || informouNovaSenha(senha, confirmarSenha);

    // SENHA
    const senhaValida =
        typeof senha === "string" &&
        senha.length >= TAMANHO_MINIMO &&
        senha.length <= TAMANHO_MAXIMO &&
        /\W/.test(senha) &&
        /\d/.test(senha) &&
        /[a-zA-Z]/.test(senha);

    // CONFIRMAR SENHA
    const confirmarSenhaValida =
        senha === confirmarSenha
        && senhaValida

    const senhaAtualValida =
        !edicao || (
            typeof confirmarSenhaAtual === "string" &&
            confirmarSenhaAtual.length >= TAMANHO_MINIMO &&
            confirmarSenhaAtual.length <= TAMANHO_MAXIMO
        );

    return {
        senha: desejaAlterarSenha ? senhaValida : true,
        confirmarSenha: desejaAlterarSenha ? confirmarSenhaValida : true,
        confirmarSenhaAtual: senhaAtualValida,
    };
}
