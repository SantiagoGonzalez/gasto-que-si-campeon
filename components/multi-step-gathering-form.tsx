"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore, type ExpenseCategory } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfMonth } from "date-fns"
import { CalendarIcon, PlusCircle, Trash2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { cn, getUserEmojis } from "@/lib/utils"
import { ExpenseForm } from "@/components/expense-form"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { useMobileDialog } from "@/lib/hooks"
import { formatCurrency } from "@/utils/formatCurrency"

type TempExpense = {
  id: string
  description: string
  amount: number
  creditorId: string
  category: ExpenseCategory
  participants: string[]
  isMeat?: boolean
}

type Step = 1 | 2 | 3

export function MultiStepGatheringForm() {
  const router = useRouter()
  const { users, addUser, addGathering, addExpense } = useStore()

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const defaultDate = startOfMonth(new Date())

  // Step 1: Basic Info
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(defaultDate)
  const [hostId, setHostId] = useState<string | undefined>(undefined)

  // Step 2: Participants
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    alias: "",
    preferences: {
      isVegan: false,
      participatesInHerb: false,
    },
  })

  // Step 3: Expenses
  const [expenses, setExpenses] = useState<TempExpense[]>([])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const { dialogRef, isMobile } = useMobileDialog(isAddExpenseOpen)

  // Pre-select all users when they change
  useEffect(() => {
    setSelectedUsers(users.map((user) => user.id))
  }, [users])

  // Step navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  // Step 1 validation
  const canProceedFromStep1 = title.trim() !== "" && date

  // Step 2 validation
  const canProceedFromStep2 = selectedUsers.length > 0

  // User management
  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAddUser = () => {
    if (newUser.name.trim() === "") return

    addUser({
      name: newUser.name,
      alias: newUser.alias || newUser.name.split(" ")[0],
      preferences: newUser.preferences,
    })

    setNewUser({
      name: "",
      alias: "",
      preferences: {
        isVegan: false,
        participatesInHerb: false,
      },
    })

    setIsAddUserOpen(false)
  }

  // Expense management
  const handleAddExpenseSubmit = (expenseData) => {
    const newExpense = {
      id: crypto.randomUUID(),
      description: expenseData.description,
      amount: Number(expenseData.amount),
      creditorId: expenseData.paidById,
      category: expenseData.category,
      participants: expenseData.participants,
      isMeat: expenseData.isMeat,
    }

    setExpenses([...expenses, newExpense])
    setIsAddExpenseOpen(false)
  }

  const handleEditExpense = (expenseData) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === expenseData.id
          ? {
              id: expense.id,
              description: expenseData.description,
              amount: expenseData.amount,
              category: expenseData.category,
              creditorId: expenseData.paidById,
              participants: expenseData.participants,
              isMeat: expenseData.isMeat,
            }
          : expense,
      ),
    )
  }

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  // Final submission
  const handleSubmit = () => {
    if (!title.trim() || !date || selectedUsers.length === 0) {
      alert("Please complete all required steps.")
      return
    }

    const gatheringId = addGathering({
      title,
      date: date.toISOString(),
      participants: selectedUsers,
      hostId: hostId,
    })

    expenses.forEach((expense) => {
      addExpense({
        gatheringId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        paidById: expense.creditorId,
        participants: expense.participants,
        date: new Date().toISOString(),
        isMeat: expense.category === "food" ? expense.isMeat : undefined,
      })
    })

    router.push(`/gatherings/${gatheringId}`)
  }

  const selectedParticipants = users.filter((user) => selectedUsers.includes(user.id))

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Gathering</h1>
          <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
        </div>

        <Progress value={(currentStep / 3) * 100} className="mb-4" />

        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Basic Info</span>
          <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Participants</span>
          <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Expenses</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Gathering Details</CardTitle>
            <CardDescription>Let's start with the basic information about your gathering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Gathering Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dinner Party, Weekend Trip, etc."
                className="h-12 text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label>Month *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-12 text-base",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3">
                    <Label>Only the month matters, not the specific day</Label>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="host">Host (Optional)</Label>
              <Select value={hostId} onValueChange={setHostId}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a host (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific host</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {getUserEmojis(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
              <Button onClick={nextStep} disabled={!canProceedFromStep1}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Participants */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Participants</CardTitle>
            <CardDescription>Choose who will be attending this gathering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-2">
              <Checkbox
                id="select-all-users"
                checked={selectedUsers.length === users.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUsers(users.map((user) => user.id))
                  } else {
                    setSelectedUsers([])
                  }
                }}
              />
              <label
                htmlFor="select-all-users"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All Users
              </label>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{selectedUsers.length} attendees selected</span>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <UserPlus className="h-4 w-4" />
                    Add New Person
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Person</DialogTitle>
                    <DialogDescription>Add a new person to your contacts.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="alias">Alias (optional)</Label>
                      <Input
                        id="alias"
                        value={newUser.alias}
                        onChange={(e) => setNewUser({ ...newUser, alias: e.target.value })}
                        placeholder="Nickname"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Preferences</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isVegan"
                          checked={newUser.preferences.isVegan}
                          onCheckedChange={(checked) =>
                            setNewUser({
                              ...newUser,
                              preferences: {
                                ...newUser.preferences,
                                isVegan: checked === true,
                              },
                            })
                          }
                        />
                        <label
                          htmlFor="isVegan"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Vegan 🌱
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="participatesInHerb"
                          checked={newUser.preferences.participatesInHerb}
                          onCheckedChange={(checked) =>
                            setNewUser({
                              ...newUser,
                              preferences: {
                                ...newUser.preferences,
                                participatesInHerb: checked === true,
                              },
                            })
                          }
                        />
                        <label
                          htmlFor="participatesInHerb"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Participates in herb expenses 🌿
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Add Person</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {users.length === 0 ? (
              <div className="p-6 bg-muted rounded-md text-center">
                <p className="text-muted-foreground text-sm mb-4">No users found. Please add users first.</p>
                <Button variant="outline" onClick={() => setIsAddUserOpen(true)}>
                  Add Your First Person
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 max-h-80 overflow-y-auto p-3 border rounded-md">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {user.name} ({user.alias}) {getUserEmojis(user)}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceedFromStep2}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Expenses */}
      {currentStep === 3 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Add Expenses</CardTitle>
              <CardDescription>Add expenses for this gathering (optional).</CardDescription>
            </div>
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1 bg-transparent">
                  <PlusCircle className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent
                ref={dialogRef}
                className={`max-w-full sm:max-w-lg ${isMobile ? "h-[90vh] bottom-0" : ""} overflow-y-auto sm:rounded-lg ${isMobile ? "rounded-b-none" : ""}`}
                style={{ maxHeight: isMobile ? "90vh" : "calc(100vh - 2rem)" }}
              >
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>Add a new expense to this gathering.</DialogDescription>
                </DialogHeader>
                <div
                  className={`${isMobile ? "overflow-y-auto pb-safe" : ""}`}
                  style={{ maxHeight: isMobile ? "calc(90vh - 10rem)" : "auto" }}
                >
                  <ExpenseForm
                    gatheringId="temp"
                    participants={selectedParticipants}
                    onSubmit={handleAddExpenseSubmit}
                    onCancel={() => setIsAddExpenseOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">No expenses added yet.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You can add expenses now or after creating the gathering.
                </p>
                <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(true)} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const payer = users.find((u) => u.id === expense.creditorId)
                  return (
                    <div
                      key={expense.id}
                      className="p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-3 relative shadow-sm"
                    >
                      <div className="absolute top-2 right-2 flex">
                        <EditExpenseDialog
                          expense={{
                            id: expense.id,
                            description: expense.description,
                            amount: expense.amount,
                            category: expense.category,
                            paidById: expense.creditorId,
                            participants: expense.participants,
                            isMeat: expense.isMeat,
                          }}
                          gatheringId="temp"
                          participants={selectedParticipants}
                          onSubmit={handleEditExpense}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="pt-2">
                        <h3 className="font-medium">{expense.description}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <p className="font-medium">{formatCurrency(expense.amount)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Paid By:</span>
                            <p className="font-medium">{payer?.name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Category:</span>
                            <p className="font-medium capitalize">
                              {expense.category}
                              {expense.category === "food" && expense.isMeat && " (meat)"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Participants:</span>
                            <p className="font-medium">{expense.participants.length} people</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {totalExpenses > 0 && (
                  <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                    <span className="font-medium">Total Expenses:</span>
                    <span className="font-bold text-lg">{formatCurrency(totalExpenses)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSubmit} className="bg-primary">
                Create Gathering
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
