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

/**
 * Indica que o usuário quer trocar a senha.
 *
 * Basta um dos dois campos preenchido: se ele digitou só a nova senha
 * ou só a confirmação, a intenção é trocar e a validação precisa
 * apontar o campo que ficou faltando, em vez de ignorar os dois.
 */
export function informouNovaSenha(senha: unknown, confirmarSenha: unknown): boolean {
    return preenchido(senha) || preenchido(confirmarSenha);
}

/**
 * Valida a senha conforme o momento do fluxo.
 *
 * No CADASTRO a senha é obrigatória.
 *
 * Na EDIÇÃO ela é opcional: deixar os dois campos em branco significa
 * "não quero trocar a senha" e não deve reprovar o formulário. Quando
 * algum dos campos é preenchido, a política completa volta a valer —
 * a mesma do cadastro e da redefinição.
 *
 * A versão anterior tentava expressar isso com
 * `senha === undefined && confirmarSenha === undefined`, mas a tela
 * inicializa os dois estados como string vazia. Esse caminho era
 * inalcançável, e a edição de qualquer campo exigia digitar uma senha
 * nova válida — era esse o motivo de a alteração de dados não passar
 * pelas validações.
 */
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

    /*
     * A senha atual confirma a identidade de quem edita. Continua
     * obrigatória na edição — inclusive quando a senha não muda —,
     * como o formulário já indica marcando o campo como obrigatório.
     */
    const senhaAtualValida =
        !edicao || (
            typeof confirmarSenhaAtual === "string" &&
            confirmarSenhaAtual.length >= TAMANHO_MINIMO &&
            confirmarSenhaAtual.length <= TAMANHO_MAXIMO
        );

    return {
        senha: desejaAlterarSenha ? senhaValida : false,
        confirmarSenha: desejaAlterarSenha ? confirmarSenhaValida : true,
        confirmarSenhaAtual: senhaAtualValida,
    };
}
