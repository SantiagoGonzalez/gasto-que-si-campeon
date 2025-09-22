"use client"
import type { ExpenseCategory } from "@/lib/store"
import { MultiStepGatheringForm } from "@/components/multi-step-gathering-form"

type TempExpense = {
  id: string
  description: string
  amount: number
  creditorId: string
  category: ExpenseCategory
  participants: string[]
  isMeat?: boolean
}

export default function NewGatheringPage() {
  return <MultiStepGatheringForm />
}
