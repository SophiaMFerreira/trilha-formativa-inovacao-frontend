type ValidarLoginParams = {
    email: unknown;
    senha: unknown;
};

export function validarLogin({email, senha}: ValidarLoginParams): boolean {

    const emailValido =
        typeof email === "string" &&
        email.trim().length > 0 &&
        email.trim().length <= 255 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const senhaValida =
        typeof senha === "string" &&
        senha.trim().length > 0 &&
        senha.length <= 255;

    return !(emailValido && senhaValida);
}