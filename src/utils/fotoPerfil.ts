import { BASE_URL_API } from "../../api/axios";

type UsuarioComFoto = {
    id: number
    nomeAventureiro: string
    fotoPerfil?: string | null
}

/** Prefixo público das imagens de perfil servidas pelo backend. */
const PREFIXO_PUBLICO_PERFIL = "image/upload/perfil/";

/**
 * Nome da pasta do usuário no servidor.
 *
 * Espelha UploadService::nomePastaUsuario do backend. Serve apenas
 * como retaguarda para registros antigos, que foram gravados com um
 * prefixo que não corresponde a nenhuma URL servida.
 */
function pastaDoUsuario(usuario: UsuarioComFoto): string {
    const nomeSanitizado = usuario.nomeAventureiro
        .toLowerCase()
        .replace(/ /g, "_")
        .replace(/[^a-z0-9_-]/g, "");

    return `${usuario.id}_${nomeSanitizado}`;
}

/**
 * URL pública da foto de perfil, ou undefined quando não há foto.
 *
 * O banco declara USUARIO.FotoPerfil como NOT NULL, então "sem foto"
 * chega da API como string vazia — e não como null. Quem tratava
 * apenas o null acabava montando uma URL terminando em barra, que o
 * navegador tenta baixar e falha.
 *
 * Retornar undefined é o que o Avatar do Chakra espera para exibir o
 * fallback, e é por isso que a ausência de foto não pode mais
 * interromper o carregamento de uma lista.
 */
export function urlDaFotoDePerfil(usuario: UsuarioComFoto | null | undefined): string | undefined {
    const caminho = usuario?.fotoPerfil?.trim();

    if (!usuario || !caminho) return undefined;

    /*
     * Caminho já no formato público: usa como veio. É o que o backend
     * grava desde a correção do UploadService, e evita remontar aqui
     * uma regra de sanitização que pertence ao servidor.
     */
    if (caminho.includes(PREFIXO_PUBLICO_PERFIL)) {
        const posicao = caminho.indexOf(PREFIXO_PUBLICO_PERFIL);

        return `${BASE_URL_API}${caminho.slice(posicao)}`;
    }

    /* Registros antigos: remonta a partir do id e do nome de aventureiro. */
    const nomeArquivo = caminho.split("/").pop()?.trim();

    if (!nomeArquivo) return undefined;

    return `${BASE_URL_API}${PREFIXO_PUBLICO_PERFIL}${pastaDoUsuario(usuario)}/${nomeArquivo}`;
}
