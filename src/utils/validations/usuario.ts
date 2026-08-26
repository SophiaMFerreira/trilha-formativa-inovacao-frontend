import { OcupacaoDTO } from "@/types_consts/ocupacao";
import { parseDate } from "@chakra-ui/react";

type ValidarUsuarioParams = {
    idUsuario: unknown
    nomeUsuario: unknown
    nomeAventureiro: unknown
    correioEletronico: unknown
    dataNascimento?: unknown
    dataAtual: string
    possuiConhecimento: unknown
    ocupacao: unknown
    listaOcupacoes: OcupacaoDTO[]
    senha: unknown
    confirmarSenha: unknown
    confirmarSenhaAtual?: unknown
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
};

export function validarUsuario({
    idUsuario,
    nomeUsuario,
    nomeAventureiro,
    correioEletronico,
    dataNascimento,
    dataAtual,
    possuiConhecimento,
    ocupacao,
    listaOcupacoes,
    senha,
    confirmarSenha,
    confirmarSenhaAtual,
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
    const emailValido =
        typeof correioEletronico === "string" &&
        correioEletronico.trim().length > 0 &&
        correioEletronico.trim().length <= 255 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correioEletronico.trim());

    // DATA NASCIMENTO
    const dataNascimentoValida = validacaoData(dataNascimento, dataAtual)

    // POSSUI CONHECIMENTO
    const possuiConhecimentoValido =
        typeof possuiConhecimento === "boolean" &&
        (possuiConhecimento === true || possuiConhecimento === false)

    // OCUPACAO
    const ocupacaoValida =
        typeof ocupacao === "number" &&
        Number.isInteger(ocupacao) &&
        listaOcupacoes.some(o => o.id === ocupacao)

    // SENHA
    const senhaValida =
        typeof senha === "string" &&
        senha.length >= 8 &&
        senha.length <= 255 &&
        /\W/.test(senha) &&
        /\d/.test(senha) &&
        /[a-zA-Z]/.test(senha);

    // CONFIRMAR SENHA
    const confirmarSenhaValida =
        senha === confirmarSenha
        && senhaValida

    // CONFIRMAR SENHA ANTIGA
    const senhaAntigaValida =
        !edicao ||
        (edicao &&
            senha === undefined &&
            confirmarSenha === undefined
        ) || (
            typeof confirmarSenhaAtual === "string" &&
            confirmarSenhaAtual.length >= 8 &&
            confirmarSenhaAtual.length <= 255
        );
    console.log(senhaAntigaValida)

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
        senhaAntigaValida
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
    };
}

function validacaoData(dataNascimento: unknown, dataAtual: string): boolean {
    //DATA NÃO PREENCHIDA
    if (
        dataNascimento === undefined ||
        dataNascimento === null ||
        (Array.isArray(dataNascimento) &&
        dataNascimento.length === 0)) {
        return true
    }

    // Deve ser um array
    if (!Array.isArray(dataNascimento)) {
        return false;
    }

    // Deve conter exatamente uma data
    if (dataNascimento.length !== 1) {
        return false;
    }

    const data = dataNascimento[0];

    // Verifica estrutura básica de DateValue
    if (
        typeof data !== "object" ||
        data === null ||

        !("day" in data) ||
        typeof data.day !== "number" ||
        !Number.isInteger(data.day) ||

        !("month" in data) ||
        typeof data.month !== "number" ||
        !Number.isInteger(data.month) ||

        !("year" in data) ||
        typeof data.year !== "number" ||
        !Number.isInteger(data.year)
    ) {
        return false;
    }

    // Verifica limites básicos
    if (
        data.year < 1 ||
        data.month < 1 ||
        data.month > 12 ||
        data.day < 1 ||
        data.day > 31
    ) {
        return false;
    }

    const dataInformada = parseDate(
        new Date(
            data.year,
            data.month - 1,
            data.day
        ))

    // Evita datas inexistentes, como 31/02
    if (
        dataInformada.year !== data.year ||
        dataInformada.month !== data.month - 1 ||
        dataInformada.day !== data.day
    ) {
        return false;
    }

    const hoje = parseDate(dataAtual)
    if (dataInformada > hoje) {
        return false;
    }

    return true;
}