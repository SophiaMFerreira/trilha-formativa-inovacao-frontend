export function validarImagem(imagem: unknown): boolean {
    const extensoesPermitidas = ["jpg", "jpeg", "png", "webp"];
    const tamanhoMaximoBytes = 2 * 1024 * 1024;

    // Sem imagem
    if (imagem === null) {
        return true;
    }

    // Tipo
    if (!(imagem instanceof File)) {
        return false;
    }

    // Tamanho
    if (imagem.size > tamanhoMaximoBytes) {
        return false;
    }

    // Extensão
    const nomeArquivo = imagem.name.toLowerCase();
    const extensao = nomeArquivo.split(".").pop();

    if (
        !extensao ||
        !extensoesPermitidas.includes(extensao)
    ) {
        return false;
    }

    return true;
}