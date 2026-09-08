import { api } from "./axios";
import { AlternativaMarcadaDTO } from "../src/types_consts/alternativa";

export const AlternativaMarcadaAPI = {

    listar() {
        return api.get("api/v1/alternativas-marcadas");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/alternativas-marcadas`);
    },

    buscarPorId(idUsuario: number, idAlternativa: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/alternativas/${idAlternativa}`);
    },

    /**
     * Idempotente por (usuário, alternativa): marcar de novo a mesma
     * alternativa substitui a resposta anterior, o que é o esperado
     * quando o usuário refaz o quiz ou a tarefa.
     */
    salvar(alternativamarcada: AlternativaMarcadaDTO) {
        return api.post("api/v1/usuarios/alternativas-marcadas", alternativamarcada);
    },

    atualizar(idUsuario: number, idAlternativa: number, alternativamarcada: AlternativaMarcadaDTO) {
        return api.put(`api/v1/usuarios/${idUsuario}/alternativas/${idAlternativa}`, alternativamarcada);
    },

    deletar(idUsuario: number, idAlternativa: number) {
        /* Estava usando api.get: a marcação nunca era removida. */
        return api.delete(`api/v1/usuarios/${idUsuario}/alternativas/${idAlternativa}`);
    },
}