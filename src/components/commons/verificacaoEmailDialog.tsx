import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Button,
    Dialog,
    HStack,
    PinInput,
    Portal,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react"

import { VerificacaoEmailAPI } from "../../../api/verificacaoEmail"
import { toaster } from "@/components/commons/toaster"
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster"
import { mensagensErroConsole } from "@/config/mensagensError"
import { erroDeValidacaoDaApi, mensagemDeErroDaApi } from "@/utils/erroApi"
import { validarCodigoVerificacao } from "@/utils/validations/verificacaoEmail"
import {
    ESPERA_REENVIO_SEGUNDOS,
    TAMANHO_CODIGO_VERIFICACAO,
    type SituacaoVerificacaoEmail,
} from "@/types_consts/verificacaoEmail"

type VerificacaoEmailDialogProps = {
    aberto: boolean
    correioEletronico: string
    /** Fechamento sem concluir: o usuário volta ao formulário intacto. */
    onCancelar: () => void
    /** Código conferido. O comprovante autoriza a criação da conta. */
    onVerificado: (comprovante: string) => void
}

/**
 * Confirmação do e-mail antes da criação da conta.
 *
 * Vive dentro da tela de cadastro, e não em uma rota própria, por um
 * motivo concreto: entre pedir o código e criar a conta o formulário
 * inteiro precisa continuar preenchido — inclusive a senha. Levar o
 * usuário para outra rota exigiria guardar esses dados em algum lugar,
 * e senha em localStorage não é opção.
 *
 * O componente não conhece o formulário: recebe o endereço, devolve o
 * comprovante e deixa a criação da conta com quem o abriu.
 */
export function VerificacaoEmailDialog({
    aberto,
    correioEletronico,
    onCancelar,
    onVerificado,
}: VerificacaoEmailDialogProps) {
    const [codigo, setCodigo] = useState<string[]>([])
    const [situacao, setSituacao] = useState<SituacaoVerificacaoEmail>("enviando")
    const [codigoInvalido, setCodigoInvalido] = useState(false)
    const [expiraEm, setExpiraEm] = useState<number | null>(null)
    const [liberaReenvioEm, setLiberaReenvioEm] = useState<number | null>(null)
    const [agora, setAgora] = useState(() => Date.now())

    /*
     * Guarda para qual endereço o código já foi pedido nesta abertura.
     * Sem isso, a dupla execução de efeitos do StrictMode dispararia
     * dois e-mails e consumiria metade da cota de envios logo de cara.
     */
    const envioFeitoPara = useRef<string | null>(null)

    const codigoTexto = codigo.join("")

    const solicitarCodigo = useCallback(async (reenvio: boolean) => {
        setSituacao("enviando")
        setCodigo([])
        setCodigoInvalido(false)

        try {
            const resposta = await VerificacaoEmailAPI.solicitar(correioEletronico)

            const minutos = resposta.data?.expiraEmMinutos ?? 0

            setExpiraEm(minutos > 0 ? Date.now() + minutos * 60_000 : null)
            setLiberaReenvioEm(Date.now() + ESPERA_REENVIO_SEGUNDOS * 1000)
            setSituacao("aguardandoCodigo")

            toaster.create(
                reenvio
                    ? mensagensToastSucesso.reenviarCodigoVerificacao
                    : mensagensToastSucesso.enviarCodigoVerificacao
            )
        } catch (e) {
            const mensagemApi = mensagemDeErroDaApi(e)

            console.error(mensagensErroConsole.enviarCodigoVerificacao, mensagemApi ?? e)

            if (!erroDeValidacaoDaApi(e)) {
                setSituacao("indisponivel")
                toaster.create(mensagensToastErro.enviarCodigoVerificacao)
                return
            }

            /*
             * A API recusou o pedido. Os dois motivos previstos —
             * e-mail já cadastrado e cota de envios esgotada — não se
             * resolvem insistindo, então a tela passa a oferecer só a
             * volta ao formulário.
             */
            setSituacao("indisponivel")

            toaster.create(
                mensagemApi
                    ? {
                        title: "Não foi possível enviar o código",
                        description: mensagemApi,
                        type: "warning",
                        closable: true,
                        duration: 9000,
                    }
                    : mensagensToastErro.enviarCodigoVerificacao
            )
        }
    }, [correioEletronico])

    /* Pede o código uma única vez por abertura do diálogo. */
    useEffect(() => {
        if (!aberto) {
            envioFeitoPara.current = null
            return
        }

        if (envioFeitoPara.current === correioEletronico) return

        envioFeitoPara.current = correioEletronico
        solicitarCodigo(false)
    }, [aberto, correioEletronico, solicitarCodigo])

    /* Um único relógio move as duas contagens, e só enquanto existirem. */
    useEffect(() => {
        if (!aberto) return
        if (expiraEm === null && liberaReenvioEm === null) return

        const intervalo = setInterval(() => setAgora(Date.now()), 1000)

        return () => clearInterval(intervalo)
    }, [aberto, expiraEm, liberaReenvioEm])

    const segundosRestantes = expiraEm === null
        ? 0
        : Math.max(Math.ceil((expiraEm - agora) / 1000), 0)

    const tempoFormatado = useMemo(
        () => `${String(Math.floor(segundosRestantes / 60)).padStart(2, "0")}:${String(segundosRestantes % 60).padStart(2, "0")}`,
        [segundosRestantes]
    )

    const segundosParaReenvio = liberaReenvioEm === null
        ? 0
        : Math.max(Math.ceil((liberaReenvioEm - agora) / 1000), 0)

    const codigoExpirado =
        situacao === "aguardandoCodigo" && expiraEm !== null && segundosRestantes <= 0

    /*
     * Recebe o código por parâmetro quando vem do preenchimento
     * automático: onValueComplete dispara no mesmo evento do
     * onValueChange, e nesse instante o estado ainda guarda os cinco
     * dígitos anteriores. Ler de codigoTexto ali enviaria um código
     * incompleto e gastaria uma das tentativas do usuário à toa.
     */
    const onConfirmar = async (codigoInformado?: string) => {
        if (situacao === "confirmando") return

        if (codigoExpirado) {
            toaster.create(mensagensToastErro.codigoVerificacaoExpirado)
            return
        }

        const codigoParaEnviar = (codigoInformado ?? codigoTexto).trim()

        if (!validarCodigoVerificacao(codigoParaEnviar)) {
            setCodigoInvalido(true)
            toaster.create(mensagensToastErro.validarCodigoVerificacao)
            return
        }

        setCodigoInvalido(false)
        setSituacao("confirmando")

        try {
            const resposta = await VerificacaoEmailAPI.confirmar(
                correioEletronico,
                codigoParaEnviar
            )

            const comprovante = resposta.data?.comprovanteVerificacao

            if (!comprovante) {
                setSituacao("aguardandoCodigo")
                toaster.create(mensagensToastErro.confirmarCodigoVerificacao)
                return
            }

            toaster.create(mensagensToastSucesso.confirmarCodigoVerificacao)

            /*
             * Quem abriu o diálogo assume daqui: cria a conta com o
             * comprovante em mãos. O estado de "confirmando" é mantido
             * para que o botão continue travado durante o cadastro.
             */
            onVerificado(comprovante)
        } catch (e) {
            const mensagemApi = mensagemDeErroDaApi(e)

            console.error(mensagensErroConsole.confirmarCodigoVerificacao, mensagemApi ?? e)

            setSituacao("aguardandoCodigo")
            setCodigo([])

            if (!erroDeValidacaoDaApi(e)) {
                toaster.create(mensagensToastErro.confirmarCodigoVerificacao)
                return
            }

            setCodigoInvalido(true)
            toaster.create(mensagensToastErro.codigoVerificacaoIncorreto)
        }
    }

    const corpo = () => {
        if (situacao === "enviando") {
            return (
                <HStack gap="3" justify="center" py="6">
                    <Spinner size="md" color="brand.primaryDark" />
                    <Text textStyle="bodyText" color="brand.neutral">
                        Enviando o código...
                    </Text>
                </HStack>
            )
        }

        if (situacao === "indisponivel") {
            return (
                <Stack gap="4" py="2">
                    <Text
                        textStyle="bodyText"
                        color="brand.neutral"
                        textAlign="justify"
                    >
                        Não foi possível enviar o código para este endereço.
                        Revise o e-mail informado no formulário ou aguarde
                        alguns minutos antes de tentar de novo.
                    </Text>
                </Stack>
            )
        }

        return (
            <Stack gap="5" py="2">
                <Text
                    textStyle="bodyText"
                    color="brand.neutral"
                    textAlign="justify"
                >
                    Enviamos um código de {TAMANHO_CODIGO_VERIFICACAO} dígitos
                    para <Text as="span" color="brand.primaryDark" fontWeight="bold">
                        {correioEletronico}
                    </Text>. Digite-o abaixo para concluir seu cadastro.
                    Verifique também a caixa de spam.
                </Text>

                <PinInput.Root
                    count={TAMANHO_CODIGO_VERIFICACAO}
                    type="numeric"
                    otp
                    size="lg"
                    value={codigo}
                    invalid={codigoInvalido}
                    disabled={situacao === "confirmando" || codigoExpirado}
                    onValueChange={(e) => {
                        setCodigo(e.value)
                        if (codigoInvalido) {
                            setCodigoInvalido(false)
                        }
                    }}
                    /* Completou os seis dígitos: confere sem exigir clique. */
                    onValueComplete={(e) => {
                        if (!codigoExpirado) {
                            onConfirmar(e.valueAsString)
                        }
                    }}
                >
                    <PinInput.HiddenInput />
                    <PinInput.Control
                        display="flex"
                        justifyContent="center"
                        gap={{ base: "1.5", sm: "3" }}
                    >
                        {Array.from({ length: TAMANHO_CODIGO_VERIFICACAO }).map((_, indice) => (
                            <PinInput.Input
                                key={indice}
                                index={indice}
                                borderColor="brand.primaryDark"
                                color="brand.primaryDark"
                                textStyle="headingMD"
                                _focusVisible={{
                                    borderColor: "brand.primaryDark",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-primaryDark)",
                                }}
                            />
                        ))}
                    </PinInput.Control>
                </PinInput.Root>

                {codigoInvalido && (
                    <Text
                        textStyle="inputPlaceholder"
                        color="brand.secondaryRed"
                        textAlign="center"
                    >
                        Código incorreto. Confira os dígitos recebidos por e-mail.
                    </Text>
                )}

                <Stack
                    direction={{ base: "column", md: "row" }}
                    w="100%"
                    gap="3"
                    justify="space-between"
                    align="center"
                >
                    <Text
                        flex={1}
                        w="100%"
                        textStyle="bodyText"
                        color={codigoExpirado ? "brand.secondaryRed" : "brand.neutral"}
                        textAlign="start"
                    >
                        {codigoExpirado
                            ? "O código expirou. Peça um novo."
                            : `O código expira em ${tempoFormatado}`}
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
                        disabled={segundosParaReenvio > 0 || situacao === "confirmando"}
                        onClick={() => solicitarCodigo(true)}
                    >
                        {segundosParaReenvio > 0
                            ? `Reenviar em ${segundosParaReenvio}s`
                            : "Reenviar código"}
                    </Button>
                </Stack>
            </Stack>
        )
    }

    return (
        <Dialog.Root
            size="md"
            lazyMount
            placement="center"
            open={aberto}
            /* Fechar pelo backdrop ou pelo Esc equivale a cancelar. */
            onOpenChange={(e) => {
                if (!e.open) {
                    onCancelar()
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title
                                textStyle="headingXL"
                                color="brand.primaryDark"
                                pt="4"
                            >
                                Confirme seu e-mail
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            {corpo()}
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                w="100%"
                                gap="3"
                            >
                                <Button
                                    flex={1}
                                    w="100%"
                                    variant="outline"
                                    size="md"
                                    disabled={situacao === "confirmando"}
                                    onClick={onCancelar}
                                >
                                    Voltar ao formulário
                                </Button>
                                <Button
                                    flex={1}
                                    w="100%"
                                    variant="solid"
                                    size="md"
                                    loading={situacao === "confirmando"}
                                    loadingText="Confirmando..."
                                    disabled={
                                        situacao !== "aguardandoCodigo" ||
                                        codigoExpirado ||
                                        codigoTexto.length < TAMANHO_CODIGO_VERIFICACAO
                                    }
                                    onClick={() => onConfirmar()}
                                >
                                    Confirmar e cadastrar
                                </Button>
                            </Stack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
