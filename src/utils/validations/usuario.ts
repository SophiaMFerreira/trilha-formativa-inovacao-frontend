import { OcupacaoDTO } from "@/types_consts/ocupacao";
import { parseDate } from "@chakra-ui/react";
import { validarImagem } from "./imagem";
import { validarSenhas } from "./senha";

type ValidarUsuarioParams = {
    idUsuario: unknown
    nomeUsuario: unknown
    nomeAventureiro: unknown
    correioEletronico: unknown
    dataNascimento?: unknown
    possuiConhecimento: unknown
    ocupacao: unknown
    listaOcupacoes: OcupacaoDTO[]
    senha: unknown
    confirmarSenha: unknown
    confirmarSenhaAtual?: unknown
    imagemArquivo: unknown
    edicao: boolean
};

export type ResultadoValidacaoUsuario = {
    valido: boolean;

    idUsuario: boolean
    nomeUsuario: boolean
    nomeAventureiro: boolean
    correioEletronico: boolean
    dataNascimento: boolean
    possuiConhecimento: boolean
    ocupacao: boolean
    senha: boolean
    confirmarSenha: boolean
    confirmarSenhaAtual: boolean
    imagemArquivo: boolean
};

/**
 * Regra única de e-mail da aplicação.
 *
 * Ficava repetida no cadastro/edição de aventureiro e nas duas telas
 * de recuperação de senha, o que já tinha produzido divergência entre
 * elas. Centralizar evita que uma tela aceite o que a outra recusa.
 */
export function validarCorreioEletronico(correioEletronico: unknown): boolean {
    return typeof correioEletronico === "string" &&
        correioEletronico.trim().length > 0 &&
        correioEletronico.trim().length <= 255 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correioEletronico.trim());
}

export function validarUsuario({
    idUsuario,
    nomeUsuario,
    nomeAventureiro,
    correioEletronico,
    dataNascimento,
    possuiConhecimento,
    ocupacao,
    listaOcupacoes,
    senha,
    confirmarSenha,
    confirmarSenhaAtual,
    imagemArquivo,
    edicao
}: ValidarUsuarioParams): ResultadoValidacaoUsuario {

    // ID DO USUÁRIO
    const idUsuarioValido =
        !edicao || (
            typeof idUsuario === "number" &&
            Number.isInteger(idUsuario) &&
            (idUsuario > 0)
        )

    // NOME COMPLETO
    const nomeValido =
        typeof nomeUsuario === "string" &&
        nomeUsuario.trim().length > 0 &&
        nomeUsuario.trim().length <= 255 &&
        nomeUsuario.trim().includes(" ")

    // NOME AVENTUREIRO
    const nomeAventureiroValido =
        typeof nomeAventureiro === "string" &&
        nomeAventureiro.trim().length > 0 &&
        nomeAventureiro.trim().length <= 255;

    // EMAIL
    const emailValido = validarCorreioEletronico(correioEletronico)

    // DATA NASCIMENTO
    const dataNascimentoValida = validacaoData(dataNascimento)

    // POSSUI CONHECIMENTO
    const possuiConhecimentoValido =
        typeof possuiConhecimento === "boolean" &&
        (possuiConhecimento === true || possuiConhecimento === false)

    // OCUPACAO
    const ocupacaoValida =
        typeof ocupacao === "number" &&
        Number.isInteger(ocupacao) &&
        listaOcupacoes.some(o => o.id === ocupacao)

    // SENHAS
    const resultadoValidacaoSenhas = validarSenhas(senha, confirmarSenha, edicao, confirmarSenhaAtual)
    
    const senhaValida = resultadoValidacaoSenhas.senha
    const confirmarSenhaValida = resultadoValidacaoSenhas.confirmarSenha
    const senhaAntigaValida = resultadoValidacaoSenhas.confirmarSenhaAtual
     
    // CONFIRMAR IMAGEM
    const imagemValida = validarImagem(imagemArquivo)

    // RESULTADO FINAL
    const valido = !(
        idUsuarioValido &&
        nomeValido &&
        nomeAventureiroValido &&
        emailValido &&
        dataNascimentoValida &&
        possuiConhecimentoValido &&
        ocupacaoValida &&
        senhaValida &&
        confirmarSenhaValida &&
        senhaAntigaValida &&
        imagemValida
    );

    return {
        valido: valido,

        idUsuario: !idUsuarioValido,
        nomeUsuario: !nomeValido,
        nomeAventureiro: !nomeAventureiroValido,
        correioEletronico: !emailValido,
        dataNascimento: !dataNascimentoValida,
        possuiConhecimento: !possuiConhecimentoValido,
        ocupacao: !ocupacaoValida,
        senha: !senhaValida,
        confirmarSenha: !confirmarSenhaValida,
        confirmarSenhaAtual: !senhaAntigaValida,
        imagemArquivo: !imagemValida,
    };
}

function validacaoData(dataNascimento: unknown): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    //DATA NÃO PREENCHIDA
    if (
        dataNascimento === undefined ||
        dataNascimento === null ) {
        return true
    }

    // Deve ser uma string de tamanho 10
    if (!(typeof dataNascimento === "string" &&
        dataNascimento.length === 10)) {
        return false;
    }

    let dia = parseInt(dataNascimento.slice(0,2));
    let mes = parseInt(dataNascimento.slice(3,5));
    let ano = parseInt(dataNascimento.slice(6,10));

    // Verifica limites básicos
    if (
        ano < 1 ||
        mes < 1 ||
        mes > 12 ||
        dia < 1 ||
        dia > 31
    ) {
        return false;
    }

    const dataInformada = new Date(ano, mes - 1, dia);

    // Evita datas inexistentes, como 31/02
    if (
        dataInformada.getFullYear() !== ano ||
        dataInformada.getMonth() !== mes - 1 ||
        dataInformada.getDate() !== dia
    ) {
        return false;
    }

    if (dataInformada > hoje) {
        return false;
    }

    return true;
}