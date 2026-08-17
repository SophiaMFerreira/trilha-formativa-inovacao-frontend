import { api } from "./axios";
import { DistintivoAdquiridoDTO } from "../src/types_consts/distintivo";

export const DistintivoAdquiridoAPI = {

    listar() {
        return api.get("distintivo-adquirido");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`usuarios/${idUsuario}/distintivos`);
    },

    buscarPorId(idUsuario: number, idDistintivo: number) {
        return api.get(`usuarios/${idUsuario}/distintivos/${idDistintivo}`);
    },

    salvar(distintivoAdquirido: DistintivoAdquiridoDTO) {
        return api.post("usuarios/distintivos", distintivoAdquirido);
    },

    deletar(idUsuario: number) {
        return api.get(`usuarios/${idUsuario}/distintivos`);
    },
}