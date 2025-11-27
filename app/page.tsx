"use client"

import { useState, useEffect, createContext, useContext } from "react"
import DraggableCard from "./components/DraggableCard"
import DraggableSurface from "./components/DraggableSurface"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"

type Line = {
  id: number
  points: string
  from: HTMLDivElement | null
  to: HTMLDivElement | null
}

type CardContextType = {
  setStartDragPoint: (point: { x: number; y: number }) => void
  setDrawingArrow: (drawing: boolean) => void
  setCurrentLineId: (id: number | null) => void
  setLines: React.Dispatch<React.SetStateAction<Line[]>>
  lines: Line[]
  points: string
  drawingArrow: boolean
  currentHoverElement: HTMLDivElement | null
  setCurrentHoverElement: (element: HTMLDivElement | null) => void
  dropPoint: HTMLDivElement | null
  setDropPoint: (element: HTMLDivElement | null) => void | null
  recalculateLinesForElement: (element: HTMLDivElement) => void
  cards: HTMLDivElement[]
  setCards: (cards: HTMLDivElement[]) => void
  smoothCurve: (
    start: { x: number; y: number },
    end: { x: number; y: number },
    steps?: number
  ) => Array<{ x: number; y: number }>
  deleteCard: (cardId: string) => void
  deleteLine: (lineId: number) => void
  getLineMidpoint: (line: Line) => { x: number; y: number } | null
  selectedCardId: string | null
  setSelectedCardId: (cardId: string | null) => void
  sidebarOpen: boolean | undefined
  setSidebarOpen: (open: boolean) => void
}
export type Card = {
  id: string
  type?: "transformer" | "lookup" | "destination"
}

function LineWithDeleteButton({
  line,
  midpoint,
}: {
  line: Line
  midpoint: { x: number; y: number } | null
}) {
  if (!midpoint) return null

  return (
    <div className="line-container">
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      >
        <path d={line.points} stroke="#B8B6B6" fill="none" strokeWidth="1" />
      </svg>
      <LineDeleteButton lineId={line.id} x={midpoint.x} y={midpoint.y} />
    </div>
  )
}

function LineDeleteButton({
  lineId,
  x,
  y,
}: {
  lineId: number
  x: number
  y: number
}) {
  const { deleteLine } = useContext(CardContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute rounded-full w-8 h-8 p-0 bg-white hover:bg-red-50 border-red-200 hover:border-red-400 z-50 shadow-sm transition-opacity"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        e.stopPropagation()
        deleteLine(lineId)
      }}
    >
      <TrashIcon className="w-4 h-4 text-red-600" />
    </Button>
  )
}

export const CardContext = createContext<CardContextType>({
  setStartDragPoint: () => {},
  setDrawingArrow: () => {},
  setCurrentLineId: () => {},
  setLines: () => {},
  lines: [],
  points: "",
  drawingArrow: false,
  currentHoverElement: null,
  setCurrentHoverElement: () => {},
  setDropPoint: () => {},
  dropPoint: null,
  recalculateLinesForElement: () => {},
  cards: [],
  setCards: () => {},
  smoothCurve: () => [],
  deleteCard: () => {},
  deleteLine: () => {},
  getLineMidpoint: () => null,
  selectedCardId: null,
  setSelectedCardId: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
})

export default function Home() {
  const [points, setPoints] = useState<string>("")
  const [lines, setLines] = useState<Line[]>([])
  const [drawingArrow, setDrawingArrow] = useState<boolean>(false)
  const [startDragPoint, setStartDragPoint] = useState<{
    x: number
    y: number
  } | null>(null)
  const [currentLineId, setCurrentLineId] = useState<number | null>(null)
  const [currentHoverElement, setCurrentHoverElement] =
    useState<HTMLDivElement | null>(null)
  const [dropPoint, setDropPoint] = useState<HTMLDivElement | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function smoothCurve(
    start: { x: number; y: number },
    end: { x: number; y: number },
    steps = 30
  ) {
    // Automatically create a nice control point in the middle, slightly above/below
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    // Create a natural-looking bulge (you can adjust height)
    const bulge = Math.abs(end.y - start.y) * 0.5 + 50 // adjust "50" for more/less curve
    const controlY = start.y < end.y ? midY - bulge : midY + bulge

    const control = { x: midX, y: controlY }

    const points = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const u = 1 - t

      const x = u * u * start.x + 2 * u * t * control.x + t * t * end.x
      const y = u * u * start.y + 2 * u * t * control.y + t * t * end.y

      points.push({ x: x, y: y })
    }

    return points
  }

  const recalculateLinesForElement = (element: HTMLDivElement) => {
    setLines((prevLines) =>
      prevLines.map((line) => {
        if (!line.from || !line.to) return line

        if (line.from !== element && line.to !== element) {
          return line
        }

        const fromRect = line.from.getBoundingClientRect()
        const toRect = line.to.getBoundingClientRect()

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

        return {
          ...line,
          points: pointsPath,
        }
      })
    )
  }

  const deleteCard = (cardId: string) => {
    // Find the connector dot element for this card
    const connectorDot = document.querySelector(
      `[data-card-id="${cardId}"]`
    ) as HTMLDivElement | null

    // Remove the card from the cards array
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId))

    // Remove all lines connected to this card's connector dot
    if (connectorDot) {
      setLines((prevLines) =>
        prevLines.filter(
          (line) => line.from !== connectorDot && line.to !== connectorDot
        )
      )
    }
  }

  const deleteLine = (lineId: number) => {
    setLines((prevLines) => prevLines.filter((line) => line.id !== lineId))
  }

  const getLineMidpoint = (line: Line): { x: number; y: number } | null => {
    if (!line.from || !line.to) return null

    const fromRect = line.from.getBoundingClientRect()
    const toRect = line.to.getBoundingClientRect()

    const start = {
      x: fromRect.x + fromRect.width / 2,
      y: fromRect.y + fromRect.height / 2,
    }

    const end = {
      x: toRect.x + toRect.width / 2,
      y: toRect.y + toRect.height / 2,
    }

    // Calculate the midpoint on the curve
    const curvePoints = smoothCurve(start, end)
    const midpointIndex = Math.floor(curvePoints.length / 2)
    return curvePoints[midpointIndex]
  }

  useEffect(() => {
    if (!drawingArrow) return

    const handleMouseMove = (e: MouseEvent) => {
      if (drawingArrow && startDragPoint) {
        // get cursor coords
        let cursorX: number = e.clientX
        let cursorY: number = e.clientY

        if (dropPoint) {
          cursorX = dropPoint.getBoundingClientRect().x
          cursorY = dropPoint.getBoundingClientRect().y
        }

        const newPoints = smoothCurve(startDragPoint, {
          x: cursorX,
          y: cursorY,
        })

        const pointsPath = `M${startDragPoint.x},${
          startDragPoint.y
        } C${newPoints
          .map((point, idx) =>
            idx > newPoints.length - 3 ? "" : `${point.x},${point.y}`
          )
          .join(" ")} ${cursorX},${cursorY}`

        setPoints(pointsPath)
        if (currentLineId !== null) {
          setLines((prevLines) =>
            prevLines.map((line) =>
              line.id === currentLineId ? { ...line, points: pointsPath } : line
            )
          )
        }
      }
    }

    const handleMouseUp = () => {
      // When finishing drawing, if we have a dropPoint and current line, bind the target
      if (dropPoint && currentLineId !== null) {
        setLines((prevLines) =>
          prevLines.map((line) =>
            line.id === currentLineId ? { ...line, to: dropPoint } : line
          )
        )
      }

      setDrawingArrow(false)
      setStartDragPoint(null)
      setCurrentLineId(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    drawingArrow,
    startDragPoint,
    currentLineId,
    currentHoverElement,
    dropPoint,
  ])

  return (
    <div className="min-h-screen min-w-screen text-black">
      <header className="w-full bg-black h-[40px]"></header>

      <CardContext
        value={{
          setStartDragPoint,
          setDrawingArrow,
          setCurrentLineId,
          setLines,
          lines,
          points,
          drawingArrow,
          currentHoverElement,
          setCurrentHoverElement,
          dropPoint,
          setDropPoint,
          recalculateLinesForElement,
          cards: cards as unknown as HTMLDivElement[],
          setCards: setCards as unknown as React.Dispatch<
            React.SetStateAction<HTMLDivElement[]>
          >,
          smoothCurve,
          deleteCard,
          deleteLine,
          getLineMidpoint,
          selectedCardId,
          setSelectedCardId,
          sidebarOpen,
          setSidebarOpen,
        }}
      >
        <DraggableSurface>
          <main className="flex flex-col gap-4 items-center justify-center">
            {cards.map((card) => (
              <DraggableCard key={card.id} cardId={card.id} />
            ))}
          </main>

          {lines.map((line) => {
            const midpoint = getLineMidpoint(line)
            return (
              <LineWithDeleteButton
                key={line.id}
                line={line}
                midpoint={midpoint}
              />
            )
          })}
        </DraggableSurface>
      </CardContext>
    </div>
  )
}
