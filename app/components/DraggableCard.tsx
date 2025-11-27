import { useContext, useEffect, useRef, useState } from "react"
import { CardContext } from "../page"
import NewActionDropdown from "./NewActionDropdown"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"

interface DraggableCardProps {
  cardId: string
}

export default function DraggableCard({ cardId }: DraggableCardProps) {
  const {
    setStartDragPoint,
    setDrawingArrow,
    setCurrentLineId,
    setLines,
    lines,
    points,
    drawingArrow,
    setCurrentHoverElement,
    currentHoverElement,
    setDropPoint,
    recalculateLinesForElement,
    deleteCard,
    selectedCardId,
    setSelectedCardId,
  } = useContext(CardContext)
  const dotConnectorRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null)
  const wasDragging = useRef(false)

  const dragStateRef = useRef<{
    startMouseX: number
    startMouseY: number
    startX: number
    startY: number
  } | null>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent clicking the connector from also starting a card drag
    e.stopPropagation()

    const cursorX = e.clientX
    const cursorY = e.clientY
    setStartDragPoint({ x: cursorX, y: cursorY })
    setDrawingArrow(true)
    const newLineId = lines.length + 1
    setCurrentLineId(newLineId)
    setLines([
      ...lines,
      { id: newLineId, points, from: dotConnectorRef.current, to: null },
    ])
    setCurrentHoverElement(e.currentTarget)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingArrow) {
      if (currentHoverElement === e.currentTarget) {
        console.log("Same element")
        setDropPoint(null)
      } else {
        console.log("Different element")
        console.log(e.currentTarget.querySelector(".connectorDot"))
        setDropPoint(e.currentTarget.querySelector(".connectorDot"))
      }
    }
  }

  const handleDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    const mouseX = e.clientX
    const mouseY = e.clientY

    dragStartPosition.current = { x: mouseX, y: mouseY }

    dragStateRef.current = {
      startMouseX: mouseX,
      startMouseY: mouseY,
      startX: position.x,
      startY: position.y,
    }

    setIsDragging(true)
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only select the card if we didn't drag
    if (!wasDragging.current) {
      e.stopPropagation()
      setSelectedCardId(cardId)
    }
    wasDragging.current = false
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return

      const { startMouseX, startMouseY, startX, startY } = dragStateRef.current
      const deltaX = e.clientX - startMouseX
      const deltaY = e.clientY - startMouseY

      // If we moved more than 5 pixels, mark as dragging
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        wasDragging.current = true
      }

      setPosition({
        x: startX + deltaX,
        y: startY + deltaY,
      })

      if (dotConnectorRef.current) {
        recalculateLinesForElement(dotConnectorRef.current)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStateRef.current = null
      dragStartPosition.current = null
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, recalculateLinesForElement])

  return (
    // <div
    //   ref={cardRef}
    //   className="draggable-card w-[200px] h-[200px] bg-gray-500 relative z-50"
    //   style={{
    //     transform: `translate(${position.x}px, ${position.y}px)`,
    //     cursor: isDragging ? "grabbing" : "grab",
    //   }}
    //   onMouseEnter={handleMouseEnter}
    //   onMouseDown={handleDragging}
    // >
    //   <div
    //     ref={dotConnectorRef}
    //     data-card-id={cardId}
    //     className="connectorDot absolute bottom-0 left-[50%] translate-x-[-50%] w-[10px] h-[10px] bg-red-500"
    //     onMouseDown={handleMouseDown}
    //   />
    //   <NewActionDropdown />
    // </div>

    <Card
      className={`draggable-card relative z-50 transition-all duration-200 ${
        selectedCardId === cardId
          ? "ring-4 ring-blue-500 ring-opacity-75 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          : ""
      }`}
      ref={cardRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleDragging}
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <NewActionDropdown />
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            deleteCard(cardId)
          }}
        >
          <TrashIcon />
        </Button>
      </CardFooter>
      <div
        ref={dotConnectorRef}
        data-card-id={cardId}
        className="connectorDot absolute bottom-0 left-[50%] translate-x-[-50%] w-[10px] h-[10px] bg-red-500"
        onMouseDown={handleMouseDown}
      />
    </Card>
  )
}
