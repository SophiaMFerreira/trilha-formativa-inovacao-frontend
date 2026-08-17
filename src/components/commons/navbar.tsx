import { NavLink } from "react-router-dom"
import { useState } from "react"

import {
  Box, Flex, HStack, VStack, IconButton, Button, Text, Drawer, Portal, CloseButton, Menu,
  Collapsible, Stack, Float, Circle, Skeleton, Image
} from "@chakra-ui/react"
import { FaBars } from "react-icons/fa"
import logoIFSudesteHorizontal from "@/assets/logo/logoIFSudeste_horizontalCompacta.svg"
import logoIFSudesteVertival from "@/assets/logo/logoIFSudeste_vertical.svg"

import { getMenuItens } from "@/config/menuConfig"
import type { ItemMenu } from "@/types_consts/menu"
import { useAuth } from "@/hooks/useAuth"
import { useGame } from "@/hooks/useGame"

export default function Navbar() {
  const { user } = useAuth()
  const { progressoTotal } = useGame()
  const role = user?.role

  const [loadedLogo, setLoadedLogo] = useState(false)
  const [loadedLogoPequena, setLoadedLogoPequena] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItens = getMenuItens(user);

  const itensEsquerda = menuItens.filter(
    item =>
      item.posicao === "esquerda" &&
      (!role ?
        item.roles.includes("")
        : item.roles.includes(role)
      )

  )

  const itensDireita = menuItens.filter(
    item =>
      item.posicao === "direita" &&
      (!role ?
        item.roles.includes("")
        : item.roles.includes(role)
      )
  )

  return (
    <Box
      as="header"
      bg="brand.primaryLight"
      shadow="card"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Flex
        h="88px"
        align="center"
        justify="space-between"
        px={{
          base: "4",
          lg: "5",
        }}
        maxW="1440px"
        mx="auto"
      >
        <NavLink to="/">
          <Box
            display={{
              base: "none",
              sm: "flex",
            }}
            alignItems="center"
            flexShrink={0}
            minW="220px"
            asChild
            _hover={{
              textDecoration: "none",
            }}
          >
            <Skeleton
              loading={!loadedLogo}
              w="auto"
              h="64px"
            >
              <Image
                src={logoIFSudesteHorizontal}
                alt="Instituto Federal Sudeste MG"
                h="64px"
                w="auto"
                display="block"
                objectFit="contain"
                onLoad={() => setLoadedLogo(true)}
              />
            </Skeleton>
          </Box>
          <Box
            display={{
              base: "flex",
              sm: "none",
            }}
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            minW="60px"
          >
            <Skeleton
              loading={!loadedLogoPequena}
              h="80px"
              w="auto"
            >
              <Image
                src={logoIFSudesteVertival}
                alt="Instituto Federal Sudeste MG"
                h="80px"
                w="auto"
                minH="80px"
                display="block"
                objectFit="contain"
                onLoad={() => setLoadedLogoPequena(true)}
              />
            </Skeleton>
          </Box>
        </NavLink>
        <HStack
          as="nav"
          gap="2"
          display={{
            base: "none",
            lg: "flex",
          }}
          justify="flex-start"
        >
          {itensEsquerda.map((item) => (
            <DesktopNavItem
              key={item.id}
              item={item}
              progresso={progressoTotal}
            />
          ))}
        </HStack>
        <HStack
          gap="3"
          display={{
            base: "none",
            lg: "flex",
          }}
        >
          {itensDireita.map((item) => (
            <DesktopActionItem
              key={item.id}
              item={item}
            />
          ))}
        </HStack>
        <IconButton
          display={{
            base: "flex",
            lg: "none",
          }}
          aria-label="Abrir menu"
          variant="ghost"
          onClick={() => setMobileOpen(true)}
          color="brand.neutral"
        >
          <FaBars size={26} color="brand.neutral" />
        </IconButton>
      </Flex>
      <Drawer.Root
        open={mobileOpen}
        onOpenChange={(e) => setMobileOpen(e.open)}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content
              bg="brand.white"
              shadow="card"
            >
              <Drawer.Header
                borderBottomWidth="1px"
                borderColor="brand.primaryDark"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bg="brand.primaryLight"
              >
                <Drawer.Title
                  textStyle="headingMD"
                  color="brand.primaryDark"
                >
                  Menu
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <IconButton
                    aria-label="Fechar menu"
                    variant="ghost"
                    color="brand.neutral"
                    size="md"
                  >
                    <CloseButton color="brand.neutral" />
                  </IconButton>
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body py="4" bg="brand.white">
                <VStack
                  align="stretch"
                  gap="2"
                >
                  {itensEsquerda.map((item) => (
                    <MobileNavItem
                      key={item.id}
                      item={item}
                      onClose={() => setMobileOpen(false)}
                      progresso={progressoTotal}
                    />
                  ))}
                </VStack>
              </Drawer.Body>
              <Drawer.Footer
                borderTopWidth="1px"
                borderColor="brand.primaryDark"
                mt="auto"
                p="4"
                bg="brand.primaryLight"
              >
                <VStack
                  w="100%"
                  align="stretch"
                  gap="3"
                >
                  {itensDireita.map((item) => (
                    <MobileActionItem
                      key={item.id}
                      item={item}
                    />
                  ))}
                </VStack>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  )
}

type ItemProps = {
  item: ItemMenu
  progresso?: number
}

function DesktopNavItem({ item, progresso }: ItemProps) {
  const { logout } = useAuth()
  const trilhaConcluida = progresso === 100

  if (item.children) {
    return (
      <Menu.Root>
        <Menu.Trigger
          asChild
          px="4"
          py="2"
          rounded="sm"
          color="brand.primaryDark"
          textStyle="bodyTextBold"
          _hover={{
            bg: "rgba(47,158,65,0.12)",
            textDecoration: "none",
          }}
        >
          <HStack gap="2">
            {item.icone}
            <Text
              whiteSpace="nowrap"
            >
              {item.titulo}
            </Text>
          </HStack>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg="brand.primaryLight"
              shadow="map"
            >
              {item.children.map((subitem) => (
                <Menu.Item
                  asChild
                  value={subitem.titulo}
                  key={subitem.id}
                  p="2"
                  _hover={{
                    bg: "rgba(47,158,65,0.12)",
                    textDecoration: "none",
                  }}
                  color="brand.primaryDark"
                  textStyle="bodyTextBold"
                >
                  <NavLink to={subitem.rota ?? "/"}>
                    {subitem.titulo}
                  </NavLink>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    )
  }

  if (item.titulo === "Sair") {
    return (
      <HStack
        gap="2"
        px="4"
        py="2"
        rounded="sm"
        color="brand.secondaryRed"
        textStyle="emphasis"
        _hover={{
          bg: "rgba(47,158,65,0.12)",
          textDecoration: "none",
        }}
        onClick={logout}
      >
        <Text
          whiteSpace="nowrap"
        >
          {item.titulo}
        </Text>
      </HStack>
    )
  }

  return (
    <NavLink to={item.rota ?? "/"}>
      <HStack
        gap="2"
        px="4"
        py="2"
        rounded="sm"
        color="brand.primaryDark"
        textStyle="emphasis"
        _hover={{
          bg: "rgba(47,158,65,0.12)",
          textDecoration: "none",
        }}
      >
        {item.icone}
        {item.titulo === "Distintivos" && trilhaConcluida ? (
          <Box position="relative">
            <Text whiteSpace="nowrap">
              {item.titulo}
            </Text>
            <Float
              placement="top-end"
              offsetX="-1.5"
              offsetY="1"
            >
              <Circle
                bg="brand.secondary"
                size="2"
              />
            </Float>
          </Box>
        ) : (
          <Text
            whiteSpace="nowrap"
          >
            {item.titulo}
          </Text>
        )}
      </HStack>
    </NavLink>
  )
}

function DesktopActionItem({ item }: ItemProps) {

  return (
    <Button
      asChild
      size="sm"
      variant={item.variante ?? "solid"}
      color={item.variante == "ghost" ? "brand.neutral" : "auto"}
      fontStyle="navigation"
    >
      <NavLink to={item.rota ?? "/"}>
        {item.titulo}
      </NavLink>
    </Button>
  )
}

type MobileItemProps = {
  item: ItemMenu
  onClose?: () => void
  progresso?: number
}

function MobileNavItem({
  item,
  onClose,
  progresso
}: MobileItemProps) {
  const { logout } = useAuth()
  const trilhaConcluida = progresso === 100

  if (item.children) {
    return (
      <Collapsible.Root>
        <Collapsible.Trigger>
          <HStack
            gap="3"
            as="nav"
            flexWrap="nowrap"
            color="brand.primaryDark"
            p="4"
            rounded="md"
            _hover={{
              bg: "rgba(47,158,65,0.12)",
              textDecoration: "none",
            }}
          >
            {item.icone}
            <Text
              textStyle="navigation"
              color="brand.neutral"
            >
              {item.titulo}
            </Text>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Stack m="2">
            {item.children.map((subitem) => (
              <NavLink
                to={subitem.rota ?? "/"}
                onClick={onClose}
                key={subitem.id}
              >
                <Text
                  textStyle="bodyTextBold"
                  color="brand.neutral"
                  p="2"

                  _hover={{
                    bg: "rgba(47,158,65,0.12)",
                    textDecoration: "none",
                  }}
                >
                  {subitem.titulo}
                </Text>
              </NavLink>
            ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    )
  }

  if (item.titulo === "Sair") {
    return (
      <HStack
        gap="3"
        as="nav"
        flexWrap="nowrap"
        color="brand.secondaryRed"
        p="4"
        rounded="md"
        _hover={{
          bg: "rgba(47,158,65,0.12)",
          textDecoration: "none",
        }}
        onClick={logout}
      >
        <Text
          textStyle="navigation"
        >
          {item.titulo}
        </Text>
      </HStack>
    )
  }
  return (
    <NavLink
      to={item.rota ?? "/"}
      onClick={onClose}
    >
      <HStack
        gap="3"
        as="nav"
        flexWrap="nowrap"
        color="brand.primaryDark"
        p="4"
        rounded="md"
        _hover={{
          bg: "rgba(47,158,65,0.12)",
          textDecoration: "none",
        }}
      >
        {item.icone}
        {item.titulo === "Distintivos" && trilhaConcluida ? (
          <Box position="relative">
            <Text
              textStyle="navigation"
              color="brand.neutral"
            >
              {item.titulo}
            </Text>
            <Float
              placement="top-end"
              offsetX="-1.5"
              offsetY="1"
            >
              <Circle
                bg="brand.secondary"
                size="2"
              />
            </Float>
          </Box>
        ) : (
          <Text
            textStyle="navigation"
            color="brand.neutral"
          >
            {item.titulo}
          </Text>
        )}
      </HStack>
    </NavLink>
  )
}

function MobileActionItem({
  item,
}: MobileItemProps) {

  return (
    <Button
      asChild
      w="100%"
      variant={item.variante ?? "solid"}
      color={item.variante == "ghost" ? "brand.neutral" : "auto"}
    >
      <NavLink to={item.rota ?? "/"}>
        {item.titulo}
      </NavLink>
    </Button>
  )
}