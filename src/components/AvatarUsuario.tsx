import { Avatar, Box, HStack, IconButton, Input } from "@chakra-ui/react";
import { ChangeEvent, useRef } from "react";
import { FaCamera, FaTrashAlt } from "react-icons/fa";
import CustomTooltip from "./commons/customTooltip";

type AvatarUsuarioProps = {
  imagem?: string;
  onChange: (file: File, preview: string) => void;
  /**
   * Remoção da imagem atual. Quando ausente, o botão de remover não é
   * exibido — é o caso do cadastro, em que ainda não existe imagem
   * salva para remover.
   */
  onRemover?: () => void;
  /** Desabilita as ações enquanto uma requisição está em andamento. */
  removendo?: boolean;
};

export function AvatarUsuario({
  imagem,
  onChange,
  onRemover,
  removendo = false,
}: AvatarUsuarioProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionarImagem = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    onChange(file, preview);

    /*
     * Limpa o input: sem isso, escolher o MESMO arquivo outra vez não
     * dispara change e a troca parece não funcionar.
     */
    e.target.value = "";
  };

  /* Só faz sentido remover o que já está salvo e visível. */
  const podeRemover = Boolean(onRemover) && Boolean(imagem);

  return (
    <Box position="relative" w="fit-content">
      <Avatar.Root
        h={{ base: "24", md: "32", lg: "36" }}
        w={{ base: "24", md: "32", lg: "36" }}
        bg="gray.200"
      >
        <Avatar.Fallback color="brand.neutral" />
        {imagem && <Avatar.Image src={imagem} />}
      </Avatar.Root>
      <HStack
        gap="1"
        position="absolute"
        bottom="2"
        right="2"
      >
        {podeRemover && (
          <CustomTooltip content="Remover foto">
            <IconButton
              aria-label="Remover foto"
              size="sm"
              rounded="full"
              variant="solid"
              bg="brand.secondaryRed"
              color="brand.white"
              _hover={{ bg: "brand.secondaryRed", opacity: 0.85 }}
              loading={removendo}
              onClick={onRemover}
            >
              <FaTrashAlt />
            </IconButton>
          </CustomTooltip>
        )}
        <CustomTooltip
          content={imagem ? "Alterar foto" : "Adicionar foto"}
        >
          <IconButton
            aria-label={imagem ? "Alterar foto" : "Adicionar foto"}
            size="sm"
            rounded="full"
            variant="solid"
            disabled={removendo}
            onClick={() => inputRef.current?.click()}
          >
            <FaCamera />
          </IconButton>
        </CustomTooltip>
      </HStack>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        display="none"
        onChange={selecionarImagem}
      />
    </Box>
  );
}
