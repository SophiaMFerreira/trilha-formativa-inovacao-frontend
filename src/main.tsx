import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ChakraProvider } from "@chakra-ui/react"
import { RouterProvider } from "react-router-dom"

import { router } from "@/app/router.tsx"
import { systemInovacao } from "./styles/theme.ts"
import { AuthProvider } from './app/AuthProvider.tsx'
import { GameProvider } from './app/GameProvider.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GameProvider>
        <ChakraProvider value={systemInovacao}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </GameProvider>
    </AuthProvider>
  </StrictMode>
)
