import { Button, Field, InputGroup, Link, Stack, Text } from "@chakra-ui/react";

import { useState } from "react";
import { AppInput } from "@/components/commons/AppInput";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { toaster } from "@/components/commons/toaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { RecuperarSenhaAPI } from "../../api/recuperarSenha";
import { validarCorreioEletronico } from "@/utils/validations/usuario";
import { CHAVE_EMAIL_RECUPERACAO } from "@/types_consts/recuperarSenha";

export default function SolicitarRecuperarSenha() {
    /*
     * Quem chega aqui a partir da tela de link expirado já informou o
     * e-mail antes: aproveitamos o valor guardado para não obrigá-lo a
     * digitar de novo.
     */
    const [correioEletronico, setCorreioEletronico] = useState(
        () => localStorage.getItem(CHAVE_EMAIL_RECUPERACAO) ?? ""
    )
    const [correioEletronicoInvalido, setCorreioEletronicoInvalido] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false)

    const onSubmitEmail = async () => {
        if (enviando) return;

        if (!validarCorreioEletronico(correioEletronico)) {
            setCorreioEletronicoInvalido(true)
            toaster.create(mensagensToastErro.validarEmailRecSenha);
            return
        }

        setCorreioEletronicoInvalido(false)
        setEnviando(true)

        try {
            await RecuperarSenhaAPI.solicitar(correioEletronico)

            /*
             * Guardado antes de sinalizar sucesso: a tela de nova senha
             * usa este valor para reenviar o link sem pedir o e-mail
             * outra vez.
             */
            localStorage.setItem(
                CHAVE_EMAIL_RECUPERACAO,
                correioEletronico.trim()
            )

            setSolicitacaoEnviada(true)
            toaster.create(mensagensToastSucesso.emailRecuperarSenha);
        } catch (e) {
            console.error(mensagensErroConsole.enviarEmailRecuperacao, e);
            toaster.create(mensagensToastErro.enviarEmailRecSenha);
        } finally {
            setEnviando(false)
        }
    }

    return (
        <CardCustomizado
            key="cardCodigo"
            titulo="Esqueceu sua senha ?"
            mensagem="Enviaremos um link para seu email para que você possa trocar sua senha."
        >
            <Stack
                mt="9"
                w="100%"
                gap="3"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmitEmail();
                }}>
                    <Field.Root required invalid={correioEletronicoInvalido}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Email
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="correioEletronico"
                                type="email"
                                value={correioEletronico}
                                placeholder="alunoInovacoes@gmail.com"
                                size="md"
                                onChange={(e) => {
                                    setCorreioEletronico(e.target.value)
                                    if (correioEletronicoInvalido) {
                                        setCorreioEletronicoInvalido(false)
                                    }
                                }}
                            />
                        </InputGroup>
                        {correioEletronicoInvalido && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                Informe um endereço de e-mail válido.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    {solicitacaoEnviada && (
                        <Text
                            mt="4"
                            textStyle="bodyText"
                            color="brand.primaryDark"
                            textAlign="justify"
                        >
                            Se este e-mail estiver cadastrado, o link de redefinição
                            já está a caminho. Verifique também a caixa de spam.
                        </Text>
                    )}
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        size="md"
                        mt="10"
                        loading={enviando}
                        loadingText="Enviando..."
                    >
                        {solicitacaoEnviada ? "Enviar novamente" : "Enviar email"}
                    </Button>
                </form>
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
            </Stack >
        </CardCustomizado >
    )
}
