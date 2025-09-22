"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExpenseForm } from "@/components/expense-form"
import type { ExpenseCategory } from "@/lib/store"
import { useMobileDialog } from "@/lib/hooks"

export type EditExpenseDialogProps = {
  expense: {
    id: string
    description: string
    amount: number
    category: ExpenseCategory
    paidById: string
    participants: string[]
    isMeat?: boolean
  }
  gatheringId: string
  participants: { id: string; name: string; preferences: { isVegan: boolean; participatesInHerb: boolean } }[]
  onSubmit: (expenseData: any) => void
}

export function EditExpenseDialog({ expense, gatheringId, participants, onSubmit }: EditExpenseDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { dialogRef, isMobile } = useMobileDialog(isOpen)

  const handleSubmit = (expenseData: any) => {
    onSubmit(expenseData)
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-8 w-8">
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          ref={dialogRef}
          className={`max-w-full sm:max-w-lg ${isMobile ? "h-[90vh] bottom-0" : ""} overflow-y-auto sm:rounded-lg ${isMobile ? "rounded-b-none" : ""}`}

          style={{ maxHeight: isMobile ? "90vh" : "calc(100vh - 2rem)" }}
        >
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the expense details.</DialogDescription>
          </DialogHeader>
          <div
            className={`${isMobile ? "overflow-y-auto pb-safe" : ""}`}
            style={{ maxHeight: isMobile ? "calc(90vh - 10rem)" : "auto" }}
          >
            <ExpenseForm
              gatheringId={gatheringId}
              participants={participants}
              onSubmit={handleSubmit}
              onCancel={() => setIsOpen(false)}
              mode="edit"
              initialData={expense}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
