import { Outlet, useLocation } from "react-router-dom"
import { Box } from "@chakra-ui/react"
import Navbar from "@/components/commons/navbar"

export default function GeneralLayout() {
  const location = useLocation()
  const semPadding = location.pathname === "/" || "/login"
  const semNavbar = location.pathname === "/login"
  return (
    <Box minH="100vh">
      {!semNavbar && <Navbar />}
      <Box
        as="main"
        px={semPadding ? 0 : { base: "5", md: "6", lg: "7" }}
        py={semPadding ? 0 : { base: "5", md: "6", lg: "7" }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}