import { Button, Field, InputGroup, Link, Stack } from "@chakra-ui/react";

import { useState } from "react";
import { AppInput } from "@/components/commons/AppInput";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { toaster } from "@/components/commons/toaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { RecuperarSenhaAPI } from "../../api/recuperarSenha";

export default function SolicitarRecuperarSenha() {
    const [correioEletronico, setCorreioEletronico] = useState("")
    const [validarCorreioEletronico, setValidarCorreioEletronico] = useState(false)

    const onSubmitEmail = async () => {
        const invalido = typeof correioEletronico === "string" &&
            correioEletronico.trim().length > 0 &&
            correioEletronico.trim().length <= 255 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correioEletronico.trim());

        if (invalido) {
            setValidarCorreioEletronico(false)
        }

        try {
            await RecuperarSenhaAPI.solicitar(correioEletronico)
            setValidarCorreioEletronico(true)
            toaster.create(mensagensToastSucesso.emailRecuperarSenha);

            localStorage.setItem("correioEletronico", JSON.stringify(correioEletronico))
        } catch (e) {
            console.error(mensagensErroConsole.enviarEmailRecuperacao, e);
            toaster.create(mensagensToastErro.enviarEmailRecSenha);
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
                    <Field.Root required invalid={validarCorreioEletronico}>
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
                                onChange={(e) => setCorreioEletronico(e.target.value)}
                            />
                        </InputGroup>
                        {!validarCorreioEletronico && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                Informe um endereço de e-mail válido.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        size="md"
                        mt="10"
                    >
                        Enviar email
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