import { useState, useEffect } from "react"

export default function useSelectOptionsWithKeys(optionsLength, submit, startIdx = -1) {
  const [currentOption, setCurrentOption] = useState(startIdx)
  
  const keydownEventHandler = (evt) => {
    const { key } = evt
    
    if (key === "ArrowDown") {
      setCurrentOption(prev => {
        evt.preventDefault()
        if (prev >= optionsLength - 1) return 0

        return prev + 1
      })
    } else if (key === "ArrowUp") {
      setCurrentOption(prev => {
        evt.preventDefault()
        if (prev <= 0) return optionsLength - 1

        return prev - 1
      })
    } else if (key === "Enter") {
      evt.preventDefault()
      setCurrentOption(prev => {
        submit(prev)
        return prev
      })
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", keydownEventHandler)

    return () => document.removeEventListener("keydown", keydownEventHandler)
  }, [optionsLength])

  const resetCurrentOption = () => setCurrentOption(startIdx)

  return [currentOption, resetCurrentOption]
}