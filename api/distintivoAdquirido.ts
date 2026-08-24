import { api } from "./axios";
import { DistintivoAdquiridoDTO } from "../src/types_consts/distintivo";

export const DistintivoAdquiridoAPI = {

    listar() {
        return api.get("api/v1/distintivo-adquirido");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/distintivos`);
    },

    buscarPorId(idUsuario: number, idDistintivo: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/distintivos/${idDistintivo}`);
    },

    salvar(distintivoAdquirido: DistintivoAdquiridoDTO) {
        return api.post("api/v1/usuarios/distintivos", distintivoAdquirido);
    },

    deletar(idUsuario: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/distintivos`);
    },
}