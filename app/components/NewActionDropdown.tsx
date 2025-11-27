import { useContext } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CardContext, Card } from "../page"
import { Button } from "@/components/ui/button"

export default function NewActionDropdown() {
  const context = useContext(CardContext)
  // Type assertion needed because CardContextType incorrectly types cards as HTMLDivElement[]
  // but it's actually Card[] in practice
  const setCards = context.setCards as unknown as React.Dispatch<
    React.SetStateAction<Card[]>
  >
  const { setLines, smoothCurve, setSelectedCardId, setSidebarOpen } = context

  const handleAddCard = (
    cardType: "transformer" | "lookup" | "destination"
  ) => {
    // Generate unique ID first
    const newCardId = String(Date.now())

    // Use functional update to ensure we have the latest cards state
    setCards((prevCards) => {
      const previousCardId =
        prevCards.length > 0 ? prevCards[prevCards.length - 1].id : null

      // Add the new card with type
      const newCard: Card = { id: newCardId, type: cardType }
      const updatedCards = [...prevCards, newCard]

      // If there's a previous card, create a line connecting them
      if (previousCardId) {
        // Wait for the DOM to update so we can find the new card's connector
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const fromConnector = document.querySelector(
              `[data-card-id="${previousCardId}"]`
            ) as HTMLDivElement | null
            const toConnector = document.querySelector(
              `[data-card-id="${newCardId}"]`
            ) as HTMLDivElement | null

            if (fromConnector && toConnector) {
              const fromRect = fromConnector.getBoundingClientRect()
              const toRect = toConnector.getBoundingClientRect()

              const start = {
                x: fromRect.x + fromRect.width / 2,
                y: fromRect.y + fromRect.height / 2,
              }

              const end = {
                x: toRect.x + toRect.width / 2,
                y: toRect.y + toRect.height / 2,
              }

              const newPoints = smoothCurve(start, end)
              const pointsPath = `M${start.x},${start.y} C${newPoints
                .map((point, idx) =>
                  idx > newPoints.length - 3 ? "" : `${point.x},${point.y}`
                )
                .join(" ")} ${end.x},${end.y}`

              // Use functional update to ensure we have the latest lines state
              setLines((prevLines) => {
                const newLineId = prevLines.length + 1
                return [
                  ...prevLines,
                  {
                    id: newLineId,
                    points: pointsPath,
                    from: fromConnector,
                    to: toConnector,
                  },
                ]
              })
            }
          })
        })
      }

      return updatedCards
    })

    // Select the card and open the sidebar for transformer, lookup, and destination
    // Use requestAnimationFrame to ensure the card is in the DOM first
    requestAnimationFrame(() => {
      setSelectedCardId(newCardId)
      setSidebarOpen(true)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Add Step</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleAddCard("transformer")}>
          Transformer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddCard("lookup")}>
          Lookup
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddCard("destination")}>
          Destination
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
