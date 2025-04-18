"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function DataLoader() {
  const { fetchUsers, fetchGatherings, fetchExpenses } = useStore()

  useEffect(() => {
    // Load all data when the app starts
    const loadData = async () => {
      try {
        await fetchUsers()
        await fetchGatherings()
        await fetchExpenses()
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [fetchUsers, fetchGatherings, fetchExpenses])

  return null
}

