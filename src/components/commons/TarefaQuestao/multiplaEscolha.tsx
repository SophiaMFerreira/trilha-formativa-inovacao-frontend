import { createListCollection, Editable, Field, Fieldset, Grid, GridItem, List, Portal, RadioCard, RadioGroup, Select, Stack, Text } from "@chakra-ui/react"
import CaixaAlternativa from "./caixaAlternativa"
import { estilosAlternativa } from "@/config/alternativasEstiloConfig"

import { QuestaoProp } from "@/types_consts/questao"
import { shuffleArray } from "@/utils/shuffle"
import { ReactNode, useMemo } from "react"
import { Alternativa, AlternativaMultiplaEscolha, } from "@/types_consts/alternativa"
import { FaCheckCircle, FaRegCircle } from "react-icons/fa"


type QuestaoProps = {
  questao: QuestaoProp;
  index: number;
  value: string;
  onChange: (value: string) => void;
  colunas?: ReactNode
};

export function MultiplaEscolha({ questao, value, onChange }: QuestaoProps) {
  const alternativas = useMemo(
    () => shuffleArray([...questao.alternativas]),
    [questao.id]
  );

  return (
    <RadioCard.Root
      display="flex"
      alignContent="center"
      justifyContent="center"
    >
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap="4"
      >
        {alternativas.map(
          (alternativa, i) => {
            const estilo = estilosAlternativa[i % estilosAlternativa.length]

            return (
              <GridItem
                key={alternativa.id}
              >
                <RadioGroup.Root
                  value={value}
                  onValueChange={(details) => {
                    if (details.value !== null) {
                      onChange(details.value);
                    }
                  }}
                >
                  <RadioCard.Item
                    value={String(alternativa.id)}

                  >
                    <RadioCard.ItemHiddenInput />
                    <CaixaAlternativa
                      texto={alternativa.texto}
                      estilo={estilo}
                      minH={false}
                    />
                  </RadioCard.Item>
                </RadioGroup.Root>
              </GridItem>
            )
          }
        )}
      </Grid>
    </RadioCard.Root>
  )
}

type QuestaoTarefaProps = {
  questao: QuestaoProp;
  index: number;
  value: string;
  onChange: (idAlternativas: string[], idQuestao: number) => void;
  colunas?: ReactNode
};

export function QuestaoRadio({
  questao,
  index,
  value,
  onChange,
  colunas
}: QuestaoTarefaProps) {
  const alternativas = useMemo(
    () => shuffleArray([...questao.alternativas]),
    [questao.id]
  );

  return (
    <Fieldset.Root>
      <Fieldset.Legend
        textStyle="bodyTextBold"
        color="brand.primaryDark"
      >
        Questão {String(index + 1).padStart(2, "0")}:
      </Fieldset.Legend>
      <Text mt="1">
        {questao.enunciado}
      </Text>
      {colunas}
      <RadioGroup.Root
        value={value}
        onValueChange={(details) => {
          if (details.value !== null) {
            onChange([details.value], index);
          }
        }}
        ml="5"
        size="sm"
        my="1"
      >
        <Stack gap="1.5">
          {alternativas.map((alternativa) => (
            <RadioGroup.Item
              key={alternativa.texto}
              value={String(alternativa.id)}
            >
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator
                borderColor="brand.neutral"
                _checked={{
                  borderColor: "brand.neutral",
                  bg: "brand.secondary",
                  color: "brand.white",
                }}
              />
              <RadioGroup.ItemText
                color="brand.neutral"
                textStyle="inputPlaceholder"
              >
                {alternativa.texto}
              </RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>
    </Fieldset.Root>
  )
}

export function QuestaoSelect({
  questao,
  index,
  value,
  onChange,
  colunas
}: QuestaoTarefaProps) {
  const alternativas = useMemo(
    () => shuffleArray([...questao.alternativas]),
    [questao.id]
  );
  const alternativasCollection = createListCollection({
    items: alternativas.map(item => ({
      label: item.texto,
      value: String(item.id)
    }))
  });

  return (
    <Field.Root>
      <Select.Root
        collection={alternativasCollection}
        value={value ? [value] : []}
        onValueChange={(details) => {
          if (details.value !== null) {
            onChange([details.value[0]], index)
          }
        }}
        size="md"
      >
        <Select.HiddenSelect />
        <Select.Label
          textStyle="bodyTextBold"
          color="brand.primaryDark"
        >
          Questão {String(index + 1).padStart(2, "0")}:
        </Select.Label>
        <Text mt="1">
          {questao.enunciado}
        </Text>
        {colunas}
        <Select.Control>
          <Select.Trigger
            borderWidth="1px"
            borderColor="brand.neutral"
            borderRadius="sm"
            bg="brand.white"
          >
            <Select.ValueText
              placeholder="Selecionar resposta"
              textStyle="inputPlaceholder"
              color="brand.neutral"

              _hover={{
                bg: "rgba(47,158,65,.05)",
                borderColor: "brand.secondary"
              }}
              _focusVisible={{
                borderColor: "brand.secondary",
                boxShadow: "0 0 0 2px rgba(47,158,65,.18)",
                color: "brand.primaryDark"
              }}
            />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator
              color="brand.neutral"
            />
          </Select.IndicatorGroup >
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content
              textStyle="inputPlaceholder"
              color="brand.neutral"
            >
              {alternativasCollection.items.map((alternativa) => (
                <Select.Item
                  _hover={{
                    bg: "rgba(47,158,65,.08)"
                  }}
                  _highlighted={{
                    bg: "rgba(47,158,65,.12)",
                    color: "brand.primaryDark"
                  }}
                  _checked={{
                    color: "brand.primaryDark"
                  }}

                  item={alternativa}
                  key={alternativa.value}
                >
                  {alternativa.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  )
}

type MultiplaEscolhaCadastro = {
  alternativas: Alternativa[]
  onClick: (value: AlternativaMultiplaEscolha) => void
}
export function MultiplaEscolhaCadastroQuiz({ alternativas, onClick }: MultiplaEscolhaCadastro) {
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2, 1fr)",
      }}
      gap="4"
    >
      {alternativas.map(
        (a, i) => {
          const estilo = estilosAlternativa[i % estilosAlternativa.length]
          if (!("subtipo" in a)) return
          const alternativa = a  as AlternativaMultiplaEscolha

          return (
            <GridItem
              key={i}

              bg={estilo.bg}
              color={estilo.color}
              borderColor={estilo.borderColor}
              borderWidth="1px"
              rounded="sm"
              cursor="pointer"
              minH="110px"
              shadow="card"
              textStyle="emphasis"

              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"

              px="4"
              py="3"

              outline={alternativa.correta ? "3px solid" : undefined}
              outlineOffset={alternativa.correta ? "2px" : undefined}
              outlineColor={alternativa.correta ? "brand.secondary" : undefined}

              onClick={() => onClick(alternativa)}
            >
              <Editable.Root
                w="100%"
                textAlign="center"
                value={alternativa.texto}
                onValueChange={(e) => onClick({ ...alternativa, texto: e.value })}
                placeholder="Conteúdo da alternativa"
              >
                <Editable.Preview
                  w="100%"
                />
                <Editable.Input />
              </Editable.Root>
            </GridItem>
          )
        }
      )}
    </Grid>
  )
}

export function MultiplaEscolhaCadastroTarefa({ alternativas, onClick }: MultiplaEscolhaCadastro) {
  return (
    <List.Root
      as="ol"
      listStyleType="upper-alpha"
      ml="10"
    >
      {alternativas.map((a, i) => {
        if (!("subtipo" in a)) return
          const alternativa = a  as AlternativaMultiplaEscolha
          
        return (
          <List.Item
            key={alternativa.id}
            _marker={{ 
              color: alternativa.correta ? 
              "brand.primaryDark" : "brand.neutral" 
            }}
            color={ 
              alternativa.correta ? 
              "brand.primaryDark" : "brand.neutral" 
            }
            textStyle={
              alternativa.correta ? 
              "bodyTextBold" : "bodyTextLong"
            }
            onClick={(e) => onClick(alternativa)}
          >
            <Editable.Root
              w="100%"
              textAlign="justify"
              value={alternativa.texto}
              onValueChange={(e) => onClick({ ...alternativa, texto: e.value })}
              placeholder="Conteúdo da alternativa"
             >
              <Editable.Preview
                w="100%"
              />
              <Editable.Input />
            </Editable.Root>
          </List.Item>
        )
      })}
    </List.Root>
  )
}