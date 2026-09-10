import axios from "axios";

/**
 * Endereço da API. Exportado para que os recursos servidos como
 * arquivo estático (imagens de perfil, por exemplo) montem a URL a
 * partir da mesma origem, em vez de repetir o host em cada módulo.
 */
export const BASE_URL_API = "http://sisgame-api.jf.ifsudestemg.edu.br/";

export const api = axios.create({
  baseURL: BASE_URL_API,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
