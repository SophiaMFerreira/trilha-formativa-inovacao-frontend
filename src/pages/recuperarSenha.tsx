import { Box, Button, Field, InputGroup, Link, Stack, Text, } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { AppInput } from "@/components/commons/AppInput";
import { useAuth } from "@/hooks/useAuth";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { toaster } from "@/components/commons/toaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { RecuperarSenhaAPI } from "../../api/recuperarSenha";
import { RecuperarSenhaDTO, retornoValidarToken } from "@/types_consts/recuperarSenha";
import { validarRecuperacaoSenha } from "@/utils/validations/recuperacaoSenha";

export default function RecuperarSenha() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")

    const [validarSenha, setValidarSenha] = useState(false)
    const [validarConfirmarSenha, setValidarConfirmarSenha] = useState(false)

    const TEMPO_EXPIRACAO = 30 * 60;

    const [tempo, setTempo] = useState(() => {
        const chaveExpiracao = "recuperacaoSenhaExpiraEm";
        const expiraEm = localStorage.getItem(chaveExpiracao);

        if (!expiraEm) {
            const novaExpiracao = Date.now() + TEMPO_EXPIRACAO * 1000;

            localStorage.setItem(chaveExpiracao, String(novaExpiracao));
            return TEMPO_EXPIRACAO;
        }

        return Math.max(
            Math.ceil((Number(expiraEm) - Date.now()) / 1000),
            0
        );
    });

    useEffect(() => {
        const chaveExpiracao = "recuperacaoSenhaExpiraEm";

        const atualizarTempo = () => {
            const expiraEm = localStorage.getItem(chaveExpiracao);

            if (!expiraEm) {
                setTempo(0);
                return;
            }

            const restante = Math.max(Math.ceil((Number(expiraEm) - Date.now()) / 1000), 0);
            setTempo(restante);
        };

        atualizarTempo();
        const intervalo = setInterval(atualizarTempo, 1000);
        return () => clearInterval(intervalo);
    }, []);

    const reenviarCodigo = async () => {
        try {
            const correioEletronico = localStorage.getItem("correioEletronico");
            if (!correioEletronico) {
                navigate("/recuperarSenha");
                return
            }
            const invalido = typeof correioEletronico === "string" &&
                correioEletronico.trim().length > 0 &&
                correioEletronico.trim().length <= 255 &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correioEletronico.trim());

            if (invalido) {
                navigate("/recuperarSenha");
                return
            }

            await RecuperarSenhaAPI.solicitar(correioEletronico)

            const novaExpiracao = Date.now() + TEMPO_EXPIRACAO * 1000;

            localStorage.setItem("recuperacaoSenhaExpiraEm", String(novaExpiracao));

            setTempo(TEMPO_EXPIRACAO);
        } catch (e) {
            console.error(mensagensErroConsole.calcularTempoCodigoRecuperacao, e);
            toaster.create(mensagensToastErro.validarCodigoRecSenha);
        }
    };

    const onSubmitNovaSenha = async () => {
        const invalido = validarRecuperacaoSenha(tempo, senha, confirmarSenha, token)

        if (!invalido.invalido) {
            if (!invalido.tempo || !invalido.token) {
                toaster.create(mensagensToastErro.validarCodigoRecSenhaTempo)
                return
            }
            
            setValidarSenha(invalido.confirmarSenha)
            setValidarConfirmarSenha(invalido.confirmarSenha)

            toaster.create(mensagensToastErro.validarCodigoRecSenha)
            return
        }

        try {
            const validacaoTokenResponse = await RecuperarSenhaAPI.validar(token!)
            if (!validacaoTokenResponse.data) return

            const validacaoToken = validacaoTokenResponse.data as retornoValidarToken
            if (!validacaoToken.valido) {
                toaster.create(mensagensToastErro.validarCodigoRecSenhaTempo)
            }
        } catch (e) {
            console.error(mensagensErroConsole.validarCodigoRecuperacao, e);
            toaster.create(mensagensToastErro.validarCodigoRecSenhaTempo)
        }

        try {
            await RecuperarSenhaAPI.redefinir({
                token: token,
                novaSenha: senha,
                novaSenhaRepeticao: confirmarSenha
            } as RecuperarSenhaDTO)

            navigate("/login");
            toaster.create(mensagensToastSucesso.recuperarSenha);
        } catch (e) {
            console.error(mensagensErroConsole.recuperarSenha, e);
            toaster.create(mensagensToastErro.enviarRecuperacaoSenha);
        }
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
                            O código expira em {`${String(Math.floor(tempo / 60)).padStart(2, "0")}:${String(tempo % 60).padStart(2, "0")}`}
                        </Text>
                        <Box flex={1} textAlign="end">
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
                                onClick={reenviarCodigo}
                            >
                                Enviar novamente o código
                            </Button>
                        </Box>
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
                    >
                        Fazer login com a nova senha
                    </Button>
                </Stack>
            </form>
        </CardCustomizado >
    );
}