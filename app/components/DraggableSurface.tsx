import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import AppSidebar from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { useContext, useState } from "react"
import { CardContext } from "../page"

export default function DraggableSurface({
  children,
}: {
  children: React.ReactNode
}) {
  const { setCards, cards } = useContext(CardContext)
  const [open, setOpen] = useState(false)
  return (
    <SidebarProvider defaultOpen={false} open={open}>
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
                setCards([...cards, { id: cards.length + 1 }])
                setOpen(true)
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
