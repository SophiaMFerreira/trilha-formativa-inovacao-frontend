import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { Box, Collapsible, Heading, Text, HStack, IconButton, List, Dialog, Portal, Stack, Button } from "@chakra-ui/react"
import { FaEdit, FaRegTrashAlt, FaCheckCircle, FaRegCircle } from "react-icons/fa"
import CustomTooltip from "./commons/customTooltip.tsx"

import { QuestaoAPI } from "../../api/questao.ts"
import { QuestaoProp } from "@/types_consts/questao.ts"
import { Alternativa, AlternativaAssociacao, AlternativaMultiplaEscolhaDTO, AlternativaOrdenacaoDTO, SubtipoAlternativaLabel, TipoAlternativa, TipoAlternativaLabel } from "@/types_consts/alternativa.ts"
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster.ts"
import { toaster } from "./commons/toaster.tsx"
import { mensagensErroConsole } from "@/config/mensagensError.ts"

function popularAlternativas(alternativas: Alternativa[]) {
  const tipoAlternativas = alternativas[0].tipoAlternativa
  switch (tipoAlternativas) {
    case TipoAlternativa.MULTIPLA_ESCOLHA: {
      const alternativasMultipla = alternativas as AlternativaMultiplaEscolhaDTO[]

      return (
        <List.Root gap="2" align="start">
          {alternativasMultipla.map((alternativa) => (
            <List.Item key={alternativa.id}>
              <HStack>
                <List.Indicator asChild color="brand.primaryDark">
                  {alternativa.correta ? (
                    <FaCheckCircle color="green" />
                  ) : (
                    <FaRegCircle />
                  )}
                </List.Indicator>
                <Text
                  textStyle="bodyText"
                  color={alternativa.correta ? "brand.primaryDark" : "brand.neutral"}
                >
                  {alternativa.texto}
                </Text>
              </HStack>
            </List.Item>
          ))}
        </List.Root>
      )
    }

    case TipoAlternativa.ORDENACAO: {
      const alternativasOrdenacao = alternativas as AlternativaOrdenacaoDTO[]
      return (
        <List.Root
          gap="2"
          align="start"
          as="ol"
          listStyle="decimal"
          ps="5"
        >
          {alternativasOrdenacao
            .sort((a, b) => a.numeroSequencia - b.numeroSequencia)
            .map((alternativa, index) => (
              <List.Item
                key={`${alternativa.id}-${index}`}
                _marker={{ color: "brand.neutral" }}
              >
                <Text textStyle="bodyText" color="brand.neutral">
                  {alternativa.texto}
                </Text>
              </List.Item>
            ))}
        </List.Root>
      )
    }

    case TipoAlternativa.ASSOCIACAO: {
      const alternativasAssociacao = alternativas as AlternativaAssociacao[]

      return (
        <HStack
          align="flex-start"
          justify="space-between"
          gap="10"
          w="100%"
          flexWrap="wrap"
        >
          <List.Root
            as="ol"
            listStyle="decimal"
            ps="5"
            gap="2"
            align="start"
            flex="1"
          >
            {alternativasAssociacao.map((alternativa) => (
              <List.Item
                key={`A-${alternativa.id}`}
                _marker={{ color: "brand.neutral" }}
              >
                <Text textStyle="bodyText">
                  {alternativa.texto}
                </Text>
              </List.Item>
            ))}
          </List.Root>
          <List.Root
            as="ol"
            listStyle="upper-alpha"
            gap="2"
            align="start"
            flex="1"
          >
            {alternativasAssociacao.map((alternativa) => (
              <List.Item
                key={`B-${alternativa.id}`}
                _marker={{ color: "brand.neutral" }}
              >
                <Text textStyle="bodyText">
                  {alternativa.alternativaAssociada.texto}
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </HStack>
      )
    }

    default:
      return (
        <Text color="brand.secondaryRed">
          Questão de tipo desconhecido.
        </Text>
      )
  }
}

type ListagemQuestao = QuestaoProp & {
  onExcluir: () => Promise<void>
}
export default function ListagemQuestao({
  id,
  enunciado,
  mensagemCorrecao,
  alternativas,
  idMissao,
  onExcluir,
}: ListagemQuestao) {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [openModalExclusao, setOpenModalExclusao] = useState(false)

  if (!alternativas) return
  if (alternativas.length === 0) return

  let tipoQuestao = "Tipo desconhecido";
  switch (alternativas[0].tipoAlternativa) {
    case TipoAlternativa.ASSOCIACAO:
    case TipoAlternativa.ORDENACAO:
      tipoQuestao = TipoAlternativaLabel[alternativas[0].tipoAlternativa];
      break;

    case TipoAlternativa.MULTIPLA_ESCOLHA:
      tipoQuestao = SubtipoAlternativaLabel[
        (alternativas[0].subtipo as keyof typeof SubtipoAlternativaLabel)
      ];
      break;
  }

  function editar(idMissao: number, idQuestao: number) {
    return navigate(`/cadastro-questoes/${idMissao}/${idQuestao}`)
  }

  async function excluir(idMissao: number, idQuestao: number) {
    try {
      if (!idMissao || !idQuestao) return
      QuestaoAPI.deletar(idMissao, idQuestao)
      toaster.create(mensagensToastSucesso.excluirQuestao)
      await onExcluir();

    } catch (erro) {
      toaster.create(mensagensToastErro.excluirQuestao)
      console.error(mensagensErroConsole.excluirQuestao, erro)
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
          onDoubleClick={() => editar(idMissao, id)}
        >
          <HStack justify="space-between" align="center" w="100%">
            <HStack gap="4" minW="0">
              <Heading textStyle="emphasis" color="brand.primaryDark">
                {tipoQuestao}
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
                {enunciado}
              </Text>
            </HStack>
            <HStack gap="2">
              <CustomTooltip content="Editar questão">
                <IconButton
                  aria-label="Editar questão"
                  variant="ghost"
                  size="md"
                  color="brand.primaryDark"
                  onClick={(e) => {
                    e.stopPropagation();
                    editar(idMissao, id)
                  }}
                >
                  <FaEdit size="lg" />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip content="Excluir questão">
                <IconButton
                  aria-label="Excluir questão"
                  variant="ghost"
                  size="md"
                  color="brand.secondaryRed"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenModalExclusao(true);
                  }}
                >
                  <FaRegTrashAlt />
                </IconButton>
              </CustomTooltip>
            </HStack>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content
          onDoubleClick={() => editar(idMissao, id)}
        >
          <Box mb="4">
            <Text
              textStyle="bodyText"
              color="brand.neutral"
            >
              {enunciado}
            </Text>
            <br />
            {popularAlternativas(alternativas)}
            <br />
            <Text
              textStyle="bodyTextLong"
              color="brand.neutral"
            >
              {mensagemCorrecao}
            </Text>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

      <Dialog.Root
        size="md"
        lazyMount
        placement="center"
        open={openModalExclusao}
        onOpenChange={(e) => setOpenModalExclusao(e.open)}
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
                  Excluir questão
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text
                  textStyle="bodyText"
                  color="brand.neutral"
                  textAlign="justify"
                  pb="4"
                >
                  Você está prestes a excluir esta questão. Após a confirmação, ela será removida permanentemente e não poderá ser recuperada.
                </Text>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  w="fit-content"
                  mx="auto"
                  gap="5"
                  align="center"
                >
                  <Heading textStyle="emphasis" color="brand.primaryDark">
                    {tipoQuestao}
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
                    {enunciado}
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
                      setOpenModalExclusao(false)
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    flex={1}
                    w="100%"
                    variant="danger"
                    onClick={() => {
                      excluir(idMissao, id)
                      setOpenModalExclusao(false)
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