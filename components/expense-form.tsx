"use client"

import { useState, useEffect } from "react"
import { useStore, type ExpenseCategory } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { cn, getUserEmojis } from "@/lib/utils"

// Update the ExpenseFormProps interface to include mode and initialData
export type ExpenseFormProps = {
  gatheringId: string
  participants: { id: string; name: string; preferences: { isVegan: boolean; participatesInHerb: boolean } }[]
  onSubmit: (expense: {
    id?: string
    gatheringId: string
    description: string
    amount: number
    category: ExpenseCategory
    paidById: string
    participants: string[]
    date: string
    isMeat?: boolean
  }) => void
  onCancel: () => void
  mode?: "add" | "edit"
  initialData?: {
    id: string
    description: string
    amount: number
    category: ExpenseCategory
    paidById: string
    participants: string[]
    isMeat?: boolean
  }
}

// Update the ExpenseForm function to handle initialData
export function ExpenseForm({
  gatheringId,
  participants,
  onSubmit,
  onCancel,
  mode = "add",
  initialData,
}: ExpenseFormProps) {
  const { users } = useStore()

  const [newExpense, setNewExpense] = useState({
    description: initialData?.description || "",
    amount: initialData?.amount ? initialData.amount.toString() : "",
    category: initialData?.category || ("food" as ExpenseCategory),
    paidById: initialData?.paidById || "",
    participants: initialData?.participants || ([] as string[]),
    isMeat: initialData?.isMeat || false,
  })

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    description: false,
    amount: false,
    paidById: false,
    participants: false,
  })

  // Initialize participants when the component mounts
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // If in edit mode with initialData, don't override the form values
      return
    }

    // Only initialize participants in add mode
    if (participants.length > 0) {
      setNewExpense((prev) => ({
        ...prev,
        participants: participants.map((p) => p.id),
      }))
    }
  }, [participants, mode, initialData])

  const handleExpenseCategoryChange = (category: ExpenseCategory) => {
    setNewExpense((prev) => {
      const updated = { ...prev, category }

      // Reset participants based on category
      if (category === "herb") {
        // For herb expenses, only include participants who participate in herb
        updated.participants = participants.filter((user) => user.preferences.participatesInHerb).map((user) => user.id)
      } else {
        // For other categories, include all participants
        updated.participants = participants.map((p) => p.id)
      }

      // Reset meat checkbox when changing categories
      if (category !== "food") {
        updated.isMeat = false
      }

      return updated
    })
  }

  const handleMeatCheckboxChange = (isMeat: boolean) => {
    setNewExpense((prev) => {
      const updated = { ...prev, isMeat }

      // If it's a meat expense, filter out vegans
      if (isMeat) {
        updated.participants = prev.participants.filter((userId) => {
          const user = participants.find((u) => u.id === userId)
          return !user?.preferences.isVegan
        })
      } else {
        // If not meat, reset to all participants
        updated.participants = participants.map((p) => p.id)
      }

      return updated
    })
  }

  const handleParticipantToggle = (userId: string) => {
    setNewExpense((prev) => {
      const participants = prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId]

      return { ...prev, participants }
    })
  }

  const handleSelectAllParticipants = (selectAll: boolean) => {
    setNewExpense((prev) => {
      // If selecting all, filter based on expense category and meat checkbox
      if (selectAll) {
        let eligibleParticipants = participants.map((p) => p.id)

        // Filter out vegans for meat expenses
        if (prev.category === "food" && prev.isMeat) {
          eligibleParticipants = eligibleParticipants.filter((userId) => {
            const user = participants.find((u) => u.id === userId)
            return !user?.preferences.isVegan
          })
        }

        // Filter out non-herb participants for herb expenses
        if (prev.category === "herb") {
          eligibleParticipants = eligibleParticipants.filter((userId) => {
            const user = participants.find((u) => u.id === userId)
            return user?.preferences.participatesInHerb
          })
        }

        return { ...prev, participants: eligibleParticipants }
      } else {
        // If deselecting all, clear participants
        return { ...prev, participants: [] }
      }
    })
  }

  // Update the button text and handler function based on mode
  const handleSubmitExpense = () => {
    // Reset validation errors
    const errors = {
      description: !newExpense.description.trim(),
      amount: !newExpense.amount,
      paidById: !newExpense.paidById,
      participants: newExpense.participants.length === 0,
    }

    setValidationErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some(Boolean)) {
      return
    }

    onSubmit({
      id: initialData?.id,
      gatheringId,
      description: newExpense.description,
      amount: Number.parseFloat(newExpense.amount),
      category: newExpense.category,
      paidById: newExpense.paidById,
      participants: newExpense.participants,
      date: new Date().toISOString(),
      isMeat: newExpense.category === "food" ? newExpense.isMeat : undefined,
    })

    // Reset form if in add mode
    if (mode === "add") {
      setNewExpense({
        description: "",
        amount: "",
        category: "food",
        paidById: "",
        participants: participants.map((p) => p.id),
        isMeat: false,
      })
    }
  }

  return (
    <div className="grid gap-4 py-4 touch-auto justify-center items-center h-screen">
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={newExpense.description}
          onChange={(e) =>
            setNewExpense({
              ...newExpense,
              description: e.target.value,
            })
          }
          placeholder="Dinner, Groceries, etc."
          className={validationErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {validationErrors.description && <p className="text-sm text-red-500">Description is required</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <CurrencyInput
          id="amount"
          value={newExpense.amount}
          onChange={(value) =>
            setNewExpense({
              ...newExpense,
              amount: value,
            })
          }
          placeholder="0.00"
          error={validationErrors.amount}
          className="h-10 sm:h-9 text-base sm:text-sm"
        />
        {validationErrors.amount && <p className="text-sm text-red-500">Amount is required</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={newExpense.category}
          onValueChange={(value) => handleExpenseCategoryChange(value as ExpenseCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="herb">Herb</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {newExpense.category === "food" && (
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="expense-meat"
            checked={newExpense.isMeat}
            onCheckedChange={(checked) => handleMeatCheckboxChange(checked === true)}
          />
          <label htmlFor="expense-meat" className="text-sm font-medium leading-none">
            This is a meat expense (vegans won't pay)
          </label>
        </div>
      )}

      {newExpense.category === "herb" && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md text-sm mt-2">
          <p>Only participants who consume herb will be included in this expense.</p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="paidBy">Paid By</Label>
        <Select
          value={newExpense.paidById}
          onValueChange={(value) =>
            setNewExpense({
              ...newExpense,
              paidById: value,
            })
          }
        >
          <SelectTrigger
            className={cn(
              validationErrors.paidById ? "border-red-500 focus-visible:ring-red-500" : "",
              "h-10 sm:h-9 text-base sm:text-sm",
            )}
          >
            <SelectValue placeholder="Select who paid" />
          </SelectTrigger>
          <SelectContent>
            {participants.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {getUserEmojis(user)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.paidById && <p className="text-sm text-red-500">Payer is required</p>}
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label>Participants</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={
                newExpense.participants.length ===
                (newExpense.category === "herb"
                  ? participants.filter((user) => user.preferences.participatesInHerb).length
                  : newExpense.category === "food" && newExpense.isMeat
                    ? participants.filter((user) => !user.preferences.isVegan).length
                    : participants.length)
              }
              onCheckedChange={(checked) => handleSelectAllParticipants(checked === true)}
            />
            <label htmlFor="select-all" className="text-xs font-medium">
              Select All
            </label>
          </div>
        </div>
        <div
          className={cn(
            "grid gap-2 max-h-40 overflow-y-auto p-2 border rounded-md",
            validationErrors.participants ? "border-red-500" : "",
          )}
        >
          {participants.map((user) => {
            // Determine if user should be disabled based on preferences
            const isDisabled =
              (newExpense.category === "herb" && !user.preferences.participatesInHerb) ||
              (newExpense.category === "food" && newExpense.isMeat && user.preferences.isVegan)

            return (
              <div key={user.id} className={`flex items-center space-x-2 ${isDisabled ? "opacity-50" : ""}`}>
                <Checkbox
                  id={`participant-${user.id}`}
                  checked={newExpense.participants.includes(user.id)}
                  onCheckedChange={() => handleParticipantToggle(user.id)}
                  disabled={isDisabled}
                />
                <label
                  htmlFor={`participant-${user.id}`}
                  className={`text-sm font-medium leading-none ${isDisabled ? "line-through" : ""}`}
                >
                  {user.name} {getUserEmojis(user)}
                </label>
              </div>
            )
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          {newExpense.participants.length} of {participants.length} participants selected
        </div>
        {validationErrors.participants && <p className="text-sm text-red-500">At least one participant is required</p>}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="h-10 sm:h-9 text-base sm:text-sm">
          Cancel
        </Button>
        <Button onClick={handleSubmitExpense} className="h-10 sm:h-9 text-base sm:text-sm">
          {mode === "add" ? "Add Expense" : "Update Expense"}
        </Button>
      </div>
    </div>
  )
}
