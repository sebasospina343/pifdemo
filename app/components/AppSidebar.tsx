import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { useContext } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import MenuDataSource from "./MenuDataSource"
import MenuTransformer from "./MenuTransformer"
import MenuLookup from "./MenuLookup"
import MenuDestination from "./MenuDestination"
import { CardContext, Card } from "../page"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export default function AppSidebar() {
  const context = useContext(CardContext)
  const cards = context.cards as unknown as Card[]
  const selectedCardId = context.selectedCardId

  // Find the selected card
  const selectedCard = selectedCardId
    ? cards.find((card) => card.id === selectedCardId)
    : null

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className="top-[40px] h-[600px]"
    >
      <ScrollArea className="h-full w-full">
        <SidebarContent>
          {selectedCard?.type === "transformer" ? (
            <MenuTransformer />
          ) : selectedCard?.type === "lookup" ? (
            <MenuLookup />
          ) : selectedCard?.type === "destination" ? (
            <MenuDestination />
          ) : (
            <MenuDataSource />
          )}
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  )
}
