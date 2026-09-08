import { Button, Field, HStack, InputGroup, Link, Spinner, Stack, Text, } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppInput } from "@/components/commons/AppInput";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { toaster } from "@/components/commons/toaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { RecuperarSenhaAPI } from "../../api/recuperarSenha";
import {
    RecuperarSenhaDTO,
    SituacaoTokenRecuperacao,
} from "@/types_consts/recuperarSenha";
import { validarRecuperacaoSenha } from "@/utils/validations/recuperacaoSenha";
import { erroDeValidacaoDaApi, mensagemDeErroDaApi } from "@/utils/erroApi";

export default function RecuperarSenha() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")

    const [validarSenha, setValidarSenha] = useState(false)
    const [validarConfirmarSenha, setValidarConfirmarSenha] = useState(false)

    const [salvando, setSalvando] = useState(false)

    /*
     * A situação do link é guardada junto com o token que a produziu.
     * Assim, se o token da URL mudar, a tela volta sozinha para
     * "verificando" durante a renderização, sem precisar de um
     * setState dentro do efeito para desfazer o estado anterior.
     */
    const [resultadoToken, setResultadoToken] = useState<{
        token: string | null
        situacao: SituacaoTokenRecuperacao
        expiraEm: number | null
    }>({ token: null, situacao: "verificando", expiraEm: null })

    const [agora, setAgora] = useState(() => Date.now())

    const situacaoToken: SituacaoTokenRecuperacao =
        resultadoToken.token === token ? resultadoToken.situacao : "verificando"

    const expiraEm = resultadoToken.token === token ? resultadoToken.expiraEm : null

    /*
     * A validade do link é a que o backend informa (DataExpiracao do
     * registro em recuperacao_senha), não uma contagem de 30 minutos
     * iniciada quando a tela abre: o link pode ter sido emitido muito
     * antes de o usuário clicar nele.
     */
    const tempo = expiraEm === null
        ? 0
        : Math.max(Math.ceil((expiraEm - agora) / 1000), 0);

    /* Link válido cujo prazo terminou com a tela aberta. */
    const situacao: SituacaoTokenRecuperacao =
        situacaoToken === "valido" && expiraEm !== null && tempo <= 0
            ? "invalido"
            : situacaoToken;

    useEffect(() => {
        let ativo = true;

        async function verificarToken() {
            if (!token || token.trim().length === 0) {
                if (!ativo) return;
                setResultadoToken({ token, situacao: "invalido", expiraEm: null });
                toaster.create(mensagensToastErro.linkRecSenhaAusente);
                return;
            }

            try {
                const resposta = await RecuperarSenhaAPI.validar(token);

                if (!ativo) return;

                if (resposta.data?.valido) {
                    setResultadoToken({
                        token,
                        situacao: "valido",
                        expiraEm: new Date(resposta.data.expiraEm).getTime(),
                    });
                    return;
                }

                setResultadoToken({ token, situacao: "invalido", expiraEm: null });
                toaster.create(mensagensToastErro.linkRecSenhaInvalido);
            } catch (e) {
                if (!ativo) return;

                console.error(
                    mensagensErroConsole.validarCodigoRecuperacao,
                    mensagemDeErroDaApi(e) ?? e
                );

                setResultadoToken({ token, situacao: "invalido", expiraEm: null });

                toaster.create(
                    erroDeValidacaoDaApi(e)
                        ? mensagensToastErro.linkRecSenhaInvalido
                        : mensagensToastErro.carregarGenerico
                );
            }
        }

        verificarToken();

        return () => { ativo = false };
    }, [token]);

    /* Um único relógio move a contagem regressiva, e só enquanto ela existe. */
    useEffect(() => {
        if (expiraEm === null) return;

        const intervalo = setInterval(() => setAgora(Date.now()), 1000);

        return () => clearInterval(intervalo);
    }, [expiraEm]);

    const tempoFormatado = useMemo(
        () => `${String(Math.floor(tempo / 60)).padStart(2, "0")}:${String(tempo % 60).padStart(2, "0")}`,
        [tempo]
    );

    const solicitarNovoLink = useCallback(
        () => navigate("/recuperarSenha"),
        [navigate]
    );

    const onSubmitNovaSenha = async () => {
        if (salvando) return;

        if (situacao !== "valido" || !token) {
            toaster.create(mensagensToastErro.linkRecSenhaInvalido);
            return;
        }

        const validacao = validarRecuperacaoSenha(tempo, senha, confirmarSenha, token)

        if (validacao.invalido) {
            setValidarSenha(validacao.senha)
            setValidarConfirmarSenha(validacao.confirmarSenha)

            if (validacao.tempo || validacao.token) {
                toaster.create(mensagensToastErro.validarCodigoRecSenhaTempo)
                return
            }

            toaster.create(mensagensToastErro.validarNovaSenha)
            return
        }

        setValidarSenha(false)
        setValidarConfirmarSenha(false)
        setSalvando(true)

        try {
            /*
             * O próprio /redefinir revalida e consome o token. Chamar
             * /validar antes seria uma requisição a mais sem ganho, e
             * abriria uma janela entre a checagem e o uso.
             */
            await RecuperarSenhaAPI.redefinir({
                token,
                novaSenha: senha,
                novaSenhaRepeticao: confirmarSenha,
            } satisfies RecuperarSenhaDTO)

            toaster.create(mensagensToastSucesso.recuperarSenha);
            navigate("/login");
        } catch (e) {
            const mensagemApi = mensagemDeErroDaApi(e);

            console.error(mensagensErroConsole.recuperarSenha, mensagemApi ?? e);

            if (!erroDeValidacaoDaApi(e)) {
                toaster.create(mensagensToastErro.enviarRecuperacaoSenha);
                return;
            }

            /*
             * A API recusou. Se o motivo foi o token, a tela precisa
             * mudar de estado — insistir no formulário não levaria a
             * nada.
             */
            if (mensagemApi?.toLowerCase().includes("token")) {
                setResultadoToken({ token, situacao: "invalido", expiraEm: null });
                toaster.create(mensagensToastErro.linkRecSenhaInvalido);
                return;
            }

            setValidarSenha(true);
            setValidarConfirmarSenha(true);
            toaster.create(mensagensToastErro.validarNovaSenha);
        } finally {
            setSalvando(false)
        }
    }

    if (situacao === "verificando") {
        return (
            <CardCustomizado
                key="cardVerificandoLink"
                titulo="Redefinir senha "
                mensagem="Estamos verificando o seu link de redefinição."
            >
                <HStack mt="9" gap="3" justify="center">
                    <Spinner size="md" color="brand.primaryDark" />
                    <Text textStyle="bodyText" color="brand.neutral">
                        Verificando o link...
                    </Text>
                </HStack>
            </CardCustomizado>
        );
    }

    if (situacao === "invalido") {
        return (
            <CardCustomizado
                key="cardLinkInvalido"
                titulo="Link não disponível "
                mensagem="Este link de redefinição não vale mais: ele pode ter expirado ou já ter sido usado."
            >
                <Stack mt="9" w="100%" gap="5">
                    <Text
                        textStyle="bodyText"
                        color="brand.neutral"
                        textAlign="justify"
                    >
                        Solicite um novo e-mail de redefinição. Cada link vale
                        uma única vez e expira depois de alguns minutos.
                    </Text>
                    <Button
                        w="100%"
                        variant="solid"
                        size="md"
                        onClick={solicitarNovoLink}
                    >
                        Solicitar novo link
                    </Button>
                    <Link
                        alignSelf="flex-end"
                        href="/login"
                        variant="underline"
                        color="brand.link"
                        _hover={{
                            color: "brand.primaryDark",
                            textDecoration: "none",
                        }}
                        textStyle="bodyText"
                    >
                        Retornar para tela de login
                    </Link>
                </Stack>
            </CardCustomizado>
        );
    }

    return (
        <CardCustomizado
            key="cardRecuperarSenha"
            titulo="Redefinir senha "
            mensagem="Defina uma nova senha para realizar login na plataforma."
        >

            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmitNovaSenha();
            }}>
                <Stack
                    mt="9"
                    w="100%"
                    gap="5"
                >
                    <Field.Root required invalid={validarSenha}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Nova senha
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="senha"
                                value={senha}
                                type="password"
                                placeholder="*************"
                                size="md"
                                onChange={(e) => setSenha(e.target.value)}
                            />
                        </InputGroup>
                        {validarSenha && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A senha deve ter no mínimo 8 caracteres, incluindo letra, número e caractere especial.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="100%"
                        gap="5"
                        my="1"
                        justify="space-between"
                        align="center"
                    >
                        <Text
                            flex={1}
                            w="100%"
                            textStyle="bodyText"
                            color="brand.neutral"
                            textAlign="start"
                        >
                            O link expira em {tempoFormatado}
                        </Text>
                        <Button
                            variant="plain"
                            size="sm"
                            p="1"
                            textStyle="bodyText"
                            color="brand.primaryDark"
                            _hover={{
                                background: "#2f9e411f",
                                textDecoration: "none",
                            }}
                            onClick={solicitarNovoLink}
                        >
                            Solicitar novo link
                        </Button>
                    </Stack>
                    <Field.Root required invalid={validarConfirmarSenha}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Confirmar nova senha
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="confirmarSenha"
                                value={confirmarSenha}
                                type="password"
                                placeholder="*************"
                                size="md"
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                            />
                        </InputGroup>
                        {validarConfirmarSenha && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A confirmação de senha deve ser igual à senha informada.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        size="md"
                        mt="3"
                        loading={salvando}
                        loadingText="Salvando..."
                    >
                        Fazer login com a nova senha
                    </Button>
                </Stack>
            </form>
        </CardCustomizado >
    );
}
