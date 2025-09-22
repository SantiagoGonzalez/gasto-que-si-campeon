"use client"

import { useEffect, useRef, useState } from "react"

// Mobile detection hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}

// Mobile dialog hook
export function useMobileDialog(isOpen: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Prevent background scrolling when dialog is open on mobile
  useEffect(() => {
    if (!isMobile) return

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0", 10) * -1)
      }
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }
  }, [isOpen, isMobile])

  // Handle input focus to ensure visibility
  useEffect(() => {
    if (!isMobile || !isOpen || !dialogRef.current) return

    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") {
        // Wait for keyboard to appear
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 300)
      }
    }

    const dialog = dialogRef.current
    dialog.addEventListener("focusin", handleFocus)

    return () => {
      dialog.removeEventListener("focusin", handleFocus)
    }
  }, [isOpen, isMobile])

  return { dialogRef, isMobile }
}
