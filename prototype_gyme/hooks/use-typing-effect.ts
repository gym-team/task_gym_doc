"use client"

import { useState, useEffect } from "react"

export function useTypingEffect(text: string, speed = 100) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    let timeoutId: NodeJS.Timeout

    const type = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        timeoutId = setTimeout(type, speed)
      } else {
        setIsComplete(true)
      }
    }

    type()

    return () => clearTimeout(timeoutId)
  }, [text, speed])

  return { displayedText, isComplete }
}
