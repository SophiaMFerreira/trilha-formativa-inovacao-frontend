import { api } from "./axios";
import { AlternativaMarcadaDTO } from "../src/types_consts/alternativa";

export const AlternativaMarcadaAPI = {

    listar() {
        return api.get("alternativas-marcadas");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`usuarios/${idUsuario}/alternativas-marcadas`);
    },

    buscarPorId(idUsuario: number, idAlternativa: number) {
        return api.get(`usuarios/${idUsuario}/alternativas/${idAlternativa}`);
    },

    salvar(alternativamarcada: AlternativaMarcadaDTO) {
        return api.post("usuarios/alternativas-marcadas", alternativamarcada);
    },

    atualizar(idUsuario: number, idAlternativa: number, alternativamarcada: AlternativaMarcadaDTO) {
        return api.put(`usuarios/${idUsuario}/alternativas/${idAlternativa}`, alternativamarcada);
    },

    deletar(idUsuario: number, idAlternativa: number) {
        return api.get(`usuarios/${idUsuario}/alternativas/${idAlternativa}`);
    },
}