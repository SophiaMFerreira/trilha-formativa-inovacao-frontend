import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Collapsible, Heading, Text, HStack, IconButton, Dialog, Portal, Button, Stack } from "@chakra-ui/react"
import { FaEdit, FaRegTrashAlt } from "react-icons/fa"
import CustomTooltip from "./commons/customTooltip.tsx"

import { MissaoAtividade, TipoAtividadeLabel } from "@/types_consts/missao.ts"
import { MissaoAPI } from "../../api/missao.ts"
import { toaster } from "./commons/toaster.tsx"
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster.ts"
import { mensagensErroConsole } from "@/config/mensagensError.ts"

type ListagemMaterial = MissaoAtividade & {
  onExcluir: () => Promise<void>
}

export default function ListagemMissaoAtividade(
  { id,
    titulo,
    tipoAtividade,
    pontuacao,
    questoes,
    onExcluir,
  }: ListagemMaterial) {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [openModalConfirmacao, setOpenModalConfirmacao] = useState(false)

  function editar(idParam: number) {
    return navigate(`/cadastro-missao-atividade/${idParam}`)
  }

  async function excluir(idParam: number) {
    try {
      if (!idParam) return
      MissaoAPI.deletar(idParam)
      toaster.create(mensagensToastSucesso.excluirMissao)
      await onExcluir();

    } catch (erro) {
      console.error(mensagensErroConsole.excluirMissaoAtividade, erro)
      toaster.create(mensagensToastErro.excluirMissao)
    }
  }

  return (
    <>
      <Collapsible.Root
        w="100%"
        maxW="2xl"
        mx="auto"
        px="20px"
        borderWidth="1px"
        borderColor="brand.primaryDark"
        rounded="sm"
        bg="brand.white"
        open={open} onOpenChange={(e) => setOpen(e.open)}
        onMouseLeave={() => setOpen(false)}
      >
        <Collapsible.Trigger
          paddingY="2"
          w="100%"
          display="block"
          onDoubleClick={() => editar(id)}
        >
          <HStack justify="space-between" align="center" w="100%">
            <HStack gap="4" minW="0">
              <Heading textStyle="emphasis" color="brand.primaryDark">
                {TipoAtividadeLabel[tipoAtividade]}
              </Heading>
              <Text
                textStyle="bodyText"
                color="brand.neutral"
                flex="1"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                maxW="md"
                boxSizing="border-box"
              >
                {titulo}
              </Text>
            </HStack>
            <HStack gap="2">
              <CustomTooltip content="Editar atividade">
                <IconButton
                  aria-label="Editar atividade"
                  variant="ghost"
                  size="md"
                  color="brand.primaryDark"
                  onClick={() => editar(id)}
                >
                  <FaEdit size="lg" />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip content="Excluir atividade">
                <IconButton
                  aria-label="Excluir atividade"
                  variant="ghost"
                  size="md"
                  color="brand.secondaryRed"
                  onClick={() => setOpenModalConfirmacao(true)}
                >
                  <FaRegTrashAlt />
                </IconButton>
              </CustomTooltip>
            </HStack>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content
          onDoubleClick={() => editar(id)}
        >
          <Stack
            mb="4"
            px="5"
            direction={{ base: "column", md: "row" }}
          >
            <Stack>
              {questoes.map((q, index) =>
                <HStack
                  gap="4"
                  minW="0"
                  key={q.id}
                >
                  <Heading textStyle="bodyTextBold" color="brand.primaryDark">
                    Questão 0{index + 1}
                  </Heading>
                  <Text
                    textStyle="bodyText"
                    color="brand.neutral"
                    flex="1"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    maxW="md"
                    boxSizing="border-box"
                  >
                    {q.enunciado}
                  </Text>
                </HStack>
              )}
            </Stack>
            <br />
            <Stack  
              w="100%"
              gap="-0.5"
            >
              <Text
                w="100%"
                textAlign="end"
                textStyle="bodyTextBold"
                color="brand.neutral"
              >
                {pontuacao}
              </Text>
              <Text
                w="100%"
                textAlign="end"
                textStyle="bodyTextLong"
                color="brand.neutral"
              >
                pontos
              </Text>
            </Stack>
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>

      <Dialog.Root
        size="md"
        lazyMount
        placement="center"
        open={openModalConfirmacao}
        onOpenChange={(e) => setOpenModalConfirmacao(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title
                  textStyle="headingMD"
                  color="brand.secondaryRed"
                >
                  Excluir missão
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text
                  textStyle="bodyText"
                  color="brand.neutral"
                  textAlign="justify"
                  pb="4"
                >
                  Você está prestes a excluir esta missãoa atividade. Após a confirmação, ela será removida permanentemente e não poderá ser recuperada.
                </Text>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  w="fit-content"
                  mx="auto"
                  gap="5"
                  align="center"
                >
                  <Heading textStyle="emphasis" color="brand.primaryDark">
                    {TipoAtividadeLabel[tipoAtividade]}
                  </Heading>
                  <Text
                    textStyle="bodyText"
                    color="brand.neutral"
                    maxW="320px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    boxSizing="border-box"
                  >
                    {titulo}
                  </Text>
                  <Text
                    textStyle="emphasis"
                    color="brand.primaryDark"
                    maxW="320px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    boxSizing="border-box"
                  >
                    {pontuacao}
                  </Text>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer justifyContent="center">
                <Stack
                  direction={{ base: "column", md: "row" }}
                  w="100%"
                  gap="2"
                >
                  <Button
                    flex={1}
                    w="100%"
                    variant="outline"
                    onClick={() => {
                      setOpenModalConfirmacao(false)
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    flex={1}
                    w="100%"
                    variant="danger"
                    onClick={() => {
                      excluir(id)
                      setOpenModalConfirmacao(false)
                    }}
                  >
                    Excluir
                  </Button>
                </Stack>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}