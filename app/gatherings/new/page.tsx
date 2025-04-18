"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore, type ExpenseCategory } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Search, PlusCircle, X, Pencil } from "lucide-react"
import { cn, getUserEmojis } from "@/lib/utils"
import { ExpenseForm } from "@/components/expense-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/utils/formatCurrency"

// Define the form data type
type GatheringFormData = {
  title: string
  date: Date
  hostId: string
  participants: string[]
  expenses: Array<{
    id: string
    description: string
    amount: number
    category: ExpenseCategory
    paidById: string
    participants: string[]
    isMeat?: boolean
  }>
}

export default function NewGatheringPage() {
  const router = useRouter()
  const { users, addGathering, fetchUsers, isLoading, addExpense } = useStore()

  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<GatheringFormData>({
    title: "",
    date: new Date(),
    hostId: "",
    participants: [],
    expenses: [],
  })

  // State for expense dialog
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    alias: "",
    preferences: {
      isVegan: false,
      participatesInHerb: false,
    },
  })

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    title: false,
  })

  // Add after other state variables
  const [editingExpense, setEditingExpense] = useState<string | null>(null)

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.alias.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle form field changes
  const handleInputChange = (field: keyof GatheringFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  // Handle participant selection
  const handleParticipantToggle = (userId: string) => {
    setFormData((prev) => {
      const isSelected = prev.participants.includes(userId)

      // If this user was selected as host and is being deselected, clear the host
      if (isSelected && userId === prev.hostId) {
        return {
          ...prev,
          participants: prev.participants.filter((id) => id !== userId),
          hostId: "",
        }
      }

      return {
        ...prev,
        participants: isSelected ? prev.participants.filter((id) => id !== userId) : [...prev.participants, userId],
      }
    })
  }

  // Handle host selection
  const handleHostChange = (userId: string) => {
    // If the user is not already selected as a participant, add them
    if (!formData.participants.includes(userId)) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, userId],
        hostId: userId,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        hostId: userId,
      }))
    }
  }

  // Handle adding a new user
  const handleAddNewUser = () => {
    if (!newUser.name.trim()) return

    const userId = crypto.randomUUID()

    // Add user to the store
    const addUserPromise = useStore.getState().addUser({
      id: userId,
      name: newUser.name,
      alias: newUser.alias || newUser.name.split(" ")[0],
      preferences: newUser.preferences,
    })

    // Add the new user to selected participants
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, userId],
    }))

    // Reset the form
    setNewUser({
      name: "",
      alias: "",
      preferences: {
        isVegan: false,
        participatesInHerb: false,
      },
    })

    // Hide the form
    setShowNewUserForm(false)
  }

  // Replace the existing handleAddExpense function
  const handleAddExpense = (expense: any) => {
    if (editingExpense) {
      // Update existing expense
      setFormData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === editingExpense ? { ...expense, id: editingExpense } : e)),
      }))
      setEditingExpense(null)
    } else {
      // Add new expense
      const expenseId = crypto.randomUUID()
      setFormData((prev) => ({
        ...prev,
        expenses: [...prev.expenses, { ...expense, id: expenseId }],
      }))
    }
    setIsExpenseDialogOpen(false)
  }

  // Handle removing an expense
  const handleRemoveExpense = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((expense) => expense.id !== id),
    }))
  }

  // Add after handleRemoveExpense function
  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense.id)
    setIsExpenseDialogOpen(true)
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Create the gathering
      const gatheringId = await addGathering({
        title: formData.title,
        date: formData.date.toISOString(),
        participants: formData.participants,
        hostId: formData.hostId || undefined,
      })

      // Add expenses if any
      if (gatheringId && formData.expenses.length > 0) {
        for (const expense of formData.expenses) {
          await addExpense({
            ...expense,
            gatheringId,
            date: new Date().toISOString(),
          })
        }
      }

      // Navigate to the confirmation page or the gathering page
      if (gatheringId) {
        setCurrentStep(4) // Move to confirmation step
      }
    } catch (error) {
      console.error("Error creating gathering:", error)
    }
  }

  // Handle next step
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1)
  }

  // Handle previous step
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Handle select all participants
  const handleSelectAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      participants: users.map((user) => user.id),
    }))
  }

  // Handle deselect all participants
  const handleDeselectAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [],
      hostId: "", // Clear host if all participants are deselected
    }))
  }

  // Validate current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== ""
      case 2:
        return formData.participants.length > 0
      default:
        return true
    }
  }

  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 3</span>
          <span className="text-sm text-muted-foreground">
            {currentStep === 1
              ? "Gathering Details"
              : currentStep === 2
                ? "Add Participants"
                : currentStep === 3
                  ? "Add Expenses (Optional)"
                  : "Confirmation"}
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    )
  }

  // Render step 1: Gathering Details
  const renderStep1 = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Gathering Name</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            onBlur={() => setTouchedFields((prev) => ({ ...prev, title: true }))}
            placeholder="Dinner, Trip, etc."
            required
          />
          {touchedFields.title && formData.title.trim() === "" && (
            <p className="text-sm text-destructive">Gathering name is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && handleInputChange("date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Host (Optional)</Label>
          <Select value={formData.hostId} onValueChange={(value) => handleInputChange("hostId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a host (optional)" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} {getUserEmojis(user)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">The host will be automatically added as a participant.</p>
        </div>
      </div>
    )
  }

  // Render step 2: Add Participants
  const renderStep2 = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 ml-2">
            <Button variant="outline" size="sm" onClick={handleSelectAllParticipants} disabled={users.length === 0}>
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAllParticipants}
              disabled={formData.participants.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Select Participants</span>
              <span className="text-sm font-normal text-muted-foreground">{formData.participants.length} selected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[40vh] overflow-y-auto">
            {filteredUsers.length === 0 && !showNewUserForm ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No users found.</p>
                <Button onClick={() => setShowNewUserForm(true)}>Create New User</Button>
              </div>
            ) : (
              <>
                {!showNewUserForm ? (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={formData.participants.includes(user.id)}
                            onCheckedChange={() => handleParticipantToggle(user.id)}
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {user.name} {getUserEmojis(user)}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`host-${user.id}`}
                            checked={formData.hostId === user.id}
                            onCheckedChange={() => handleHostChange(user.id)}
                            disabled={!formData.participants.includes(user.id)}
                          />
                          <label
                            htmlFor={`host-${user.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            Host
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="new-user-name">Name</Label>
                      <Input
                        id="new-user-name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-user-alias">Alias (optional)</Label>
                      <Input
                        id="new-user-alias"
                        value={newUser.alias}
                        onChange={(e) => setNewUser({ ...newUser, alias: e.target.value })}
                        placeholder="Nickname"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Preferences</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="new-user-isVegan"
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
                        <label htmlFor="new-user-isVegan" className="text-sm font-medium leading-none cursor-pointer">
                          Vegan 🌱
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="new-user-participatesInHerb"
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
                          htmlFor="new-user-participatesInHerb"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Participates in herb expenses 🌿
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowNewUserForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddNewUser} disabled={!newUser.name.trim()}>
                        Add User
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t">
            {!showNewUserForm && (
              <Button variant="outline" onClick={() => setShowNewUserForm(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            )}
            {formData.participants.length === 0 && (
              <p className="text-sm text-destructive">At least one participant is required</p>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render step 3: Add Expenses (Optional)
  const renderStep3 = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Initial Expenses (Optional)</h2>
          <Button onClick={() => setIsExpenseDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {formData.expenses.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No expenses added yet. This step is optional.</p>
              <Button variant="outline" onClick={() => setIsExpenseDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {formData.expenses.map((expense) => {
              const payer = users.find((u) => u.id === expense.paidById)
              const participantCount = expense.participants.length

              return (
                <Card key={expense.id} className="relative">
                  <CardContent className="p-6 pt-8 pb-8">
                    <div className="flex justify-end gap-1 absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditExpense(expense)}
                        title="Edit expense"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveExpense(expense.id)}
                        title="Remove expense"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-m font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                          {expense.category === "food" && expense.isMeat && " (meat)"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-muted-foreground">Paid by {payer?.name || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        {participantCount} participant{participantCount !== 1 ? "s" : ""} •
                        {formatCurrency(expense.amount / participantCount)} per person
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Add an initial expense to this gathering.</DialogDescription>
            </DialogHeader>
            <ExpenseForm
              gatheringId="temp" // Temporary ID, will be replaced when the gathering is created
              participants={users.filter((user) => formData.participants.includes(user.id))}
              onSubmit={handleAddExpense}
              onCancel={() => {
                setIsExpenseDialogOpen(false)
                setEditingExpense(null)
              }}
              mode={editingExpense ? "edit" : "add"}
              initialData={editingExpense ? formData.expenses.find((e) => e.id === editingExpense) : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Render step 4: Confirmation
  const renderStep4 = () => {
    const selectedParticipants = users.filter((user) => formData.participants.includes(user.id))
    const host = users.find((user) => user.id === formData.hostId)
    const totalExpenses = formData.expenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Gathering Created!</h2>
          <p className="text-muted-foreground">Your gathering has been successfully created.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gathering Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p>{format(formData.date, "PPP")}</p>
            </div>
            {host && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Host</h3>
                <p>{host.name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Participants ({selectedParticipants.length})
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedParticipants.map((participant) => (
                  <span
                    key={participant.id}
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {participant.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Expenses ({formData.expenses.length})</h3>
              {formData.expenses.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {formData.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between text-sm">
                      <span>{expense.description}</span>
                      <span>{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm">No expenses added</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                // Reset form and go back to step 1
                setFormData({
                  title: "",
                  date: new Date(),
                  hostId: "",
                  participants: [],
                  expenses: [],
                })
                setCurrentStep(1)
              }}
            >
              Create Another Gathering
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                // Find the created gathering ID
                const createdGathering = useStore
                  .getState()
                  .gatherings.find(
                    (g) => g.title === formData.title && g.participants.some((p) => formData.participants.includes(p)),
                  )
                if (createdGathering) {
                  router.push(`/gatherings/${createdGathering.id}`)
                } else {
                  router.push("/gatherings")
                }
              }}
            >
              View Gathering
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render navigation buttons
  const renderNavigation = () => {
    if (currentStep === 4) return null // No navigation on confirmation screen

    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.push("/gatherings")}>
            Cancel
          </Button>
        )}

        {currentStep < 3 ? (
          <Button onClick={handleNext} disabled={!isStepValid() || isLoading}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleSubmit} disabled={isLoading}>
              Skip and Create
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Gathering"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Create New Gathering</h1>

      {currentStep < 4 && renderProgressIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {renderNavigation()}
    </div>
  )
}

