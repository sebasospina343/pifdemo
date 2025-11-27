import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import AppSidebar from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { useContext } from "react"
import { CardContext, Card } from "../page"

export default function DraggableSurface({
  children,
}: {
  children: React.ReactNode
}) {
  const context = useContext(CardContext)
  const cards = context.cards as unknown as Card[]
  const setCards = context.setCards as unknown as React.Dispatch<
    React.SetStateAction<Card[]>
  >
  const { sidebarOpen, setSidebarOpen, setSelectedCardId } = context
  const open = sidebarOpen ?? false
  return (
    <SidebarProvider
      defaultOpen={false}
      open={open}
      onOpenChange={setSidebarOpen}
    >
      <AppSidebar />
      <main className="w-full h-full">
        {/* <SidebarTrigger className="cursor-pointer" /> */}
        {cards.length === 0 && (
          <div className="flex flex-col gap-4 w-full text-center items-center justify-center my-20">
            <p className="text-2xl font-bold text-slate-300">
              Create a new data source
            </p>
            <Button
              onClick={() => {
                // Generate unique ID first
                const newCardId = String(Date.now())

                // Use functional update to ensure we have the latest cards state
                setCards((prevCards) => {
                  const newCard: Card = { id: newCardId }
                  return [...prevCards, newCard]
                })

                // Select the new card and open the sidebar
                // Use requestAnimationFrame to ensure the card is in the DOM first
                requestAnimationFrame(() => {
                  setSelectedCardId(newCardId)
                  setSidebarOpen(true)
                })
              }}
            >
              Create
            </Button>
          </div>
        )}
        {cards.length > 0 && children}
      </main>
    </SidebarProvider>
  )
}
