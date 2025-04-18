"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, ArrowLeft, Trash2, Copy, Check, ArrowDown, ArrowUp, UserPlus, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getUserEmojis } from "@/lib/utils"
import { ExpenseForm } from "@/components/expense-form"
// Add import for EditExpenseDialog
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { ShareButton } from "@/components/share-button"
import { useMobileDialog } from "@/lib/hooks"
import { formatCurrency } from "@/utils/formatCurrency"

// Update imports to use our utility file
import { formatDisplayDate } from "@/utils/date-utils"

// Add this function to handle copying text to clipboard
const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopy} title={label}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

// Function to calculate financial data for each participant
const calculateParticipantFinances = (participants, expenses, transactions) => {
  return participants.map((participant) => {
    // Calculate how much this participant paid (as a creditor)
    const paidExpenses = expenses.filter((expense) => expense.paidById === participant.id)
    const amountPaid = paidExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate how much this participant owes (as a debtor)
    const amountOwed = transactions
      .filter((transaction) => transaction.fromUserId === participant.id)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    // Calculate how much this participant is owed (as a creditor)
    const amountOwedToThem = transactions
      .filter((transaction) => transaction.toUserId === participant.id)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    // Calculate final balance
    const finalBalance = amountPaid - amountOwedToThem
    // const finalBalance = amountOwed - amountPaid

    // Calculate contribution to each expense
    const expenseContributions = expenses
      .map((expense) => {
        // Check if participant is eligible for this expense
        const isEligible = expense.participants.includes(participant.id)

        // If not eligible, contribution is 0
        if (!isEligible) return { expense, contribution: 0 }

        // Calculate share amount
        const shareAmount = expense.amount / expense.participants.length

        return {
          expense,
          contribution: shareAmount,
          isPayer: expense.paidById === participant.id,
        }
      })
      .filter((item) => item.contribution > 0 || item.isPayer)

    console.log(expenseContributions)
    // Determine if this participant is a creditor or debtor
    const isCreditor = amountOwedToThem > 0
    const isDebtor = amountOwed > 0
    const totalContributions = expenseContributions.reduce((sum, item) => sum + item.contribution, 0)

    return {
      participant,
      amountPaid,
      amountOwed,
      amountOwedToThem,
      finalBalance,
      expenseContributions,
      paidExpenses,
      isCreditor,
      isDebtor,
      totalContributions,
    }
  })
}

export default function GatheringPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const gatheringId = params.id as string

  // Get the tab from search params or default to "expenses"
  const defaultTab = searchParams.get("tab") || "expenses"

  const {
    gatherings,
    users,
    expenses,
    addExpense,
    removeExpense,
    calculateDebts,
    removeGathering,
    updateGathering,
    addUser,
    updateExpense,
  } = useStore()

  const gathering = gatherings.find((g) => g.id === gatheringId)
  const gatheringExpenses = expenses.filter((e) => e.gatheringId === gatheringId)

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const transactions = calculateDebts(gatheringId)

  // Calculate totals
  const totalExpenses = gatheringExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Add state for new user
  const [newUser, setNewUser] = useState({
    name: "",
    alias: "",
    preferences: {
      isVegan: false,
      participatesInHerb: false,
    },
  })

  // Add state for showing the new user form
  const [showNewUserForm, setShowNewUserForm] = useState(false)

  // Add function to handle adding a new user
  const handleAddNewUser = () => {
    if (!newUser.name.trim()) return

    const userId = crypto.randomUUID()

    addUser({
      id: userId,
      name: newUser.name,
      alias: newUser.alias || newUser.name.split(" ")[0],
      preferences: newUser.preferences,
    })

    // Add the new user to selected users
    setSelectedUsers([...selectedUsers, userId])

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

  useEffect(() => {
    // Initialize selected users with current participants
    if (gathering) {
      setSelectedUsers(users.filter((user) => !gathering.participants.includes(user.id)).map((user) => user.id))
    }
  }, [gathering, users])

  if (!gathering) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Gathering Not Found</h1>
        <p className="mb-8">The gathering you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    )
  }

  const participants = users.filter((user) => gathering.participants.includes(user.id))
  const nonParticipants = users.filter((user) => !gathering.participants.includes(user.id))

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAddParticipants = () => {
    if (selectedUsers.length === 0) return

    const updatedParticipants = [...gathering.participants, ...selectedUsers]
    updateGathering(gatheringId, { participants: updatedParticipants })
    setIsAddParticipantOpen(false)
  }

  const handleAddExpenseSubmit = (expenseData) => {
    addExpense(expenseData)
    setIsAddExpenseOpen(false)
  }

  const handleDeleteGathering = () => {
    if (confirm("Are you sure you want to delete this gathering and all its expenses?")) {
      removeGathering(gatheringId)
      router.push("/gatherings")
    }
  }

  // Update the handleDeleteExpense function to include handleEditExpense
  const handleEditExpense = (expenseData) => {
    updateExpense(expenseData.id, {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      paidById: expenseData.paidById,
      participants: expenseData.participants,
      isMeat: expenseData.isMeat,
    })
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      removeExpense(id)
    }
  }

  const getCategoryEmoji = (expense) => {
    switch (expense.category) {
      case "food":
        return expense.isMeat ? "🍖" : "🌱"
      case "herb":
        return "🌿"
      case "other":
        return "📦"
      default:
        return ""
    }
  }

  const { dialogRef, isMobile } = useMobileDialog(isAddExpenseOpen)

  // Use the new function to calculate participant finances
  const participantFinances = calculateParticipantFinances(participants, expenses, transactions)

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/gatherings")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{gathering.title}</h1>
          <p className="text-muted-foreground">{formatDisplayDate(gathering.date)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-4 sm:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="py-2 sm:py-4">
            <p className="text-xl sm:text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Participants</CardTitle>
              <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Participants</DialogTitle>
                    <DialogDescription>Add more participants to this gathering.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {nonParticipants.length === 0 && !showNewUserForm ? (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">All users are already participants.</p>
                        <Button onClick={() => setShowNewUserForm(true)}>Create New User</Button>
                      </div>
                    ) : (
                      <>
                        {!showNewUserForm ? (
                          <>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-medium">Select Existing Users</h3>
                              <Button variant="outline" size="sm" onClick={() => setShowNewUserForm(true)}>
                                Create New User
                              </Button>
                            </div>
                            <div className="grid gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                              {nonParticipants.map((user) => (
                                <div key={user.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`add-user-${user.id}`}
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={() => handleUserToggle(user.id)}
                                  />
                                  <label
                                    htmlFor={`add-user-${user.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {user.name} ({user.alias}) {getUserEmojis(user)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-medium">Create New User</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNewUserForm(false)}
                                disabled={nonParticipants.length === 0}
                              >
                                Select Existing Users
                              </Button>
                            </div>
                            <div className="space-y-4">
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
                                  <label
                                    htmlFor="new-user-isVegan"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
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
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Participates in herb expenses 🌿
                                  </label>
                                </div>
                              </div>
                              <Button onClick={handleAddNewUser} disabled={!newUser.name.trim()} className="w-full">
                                Add New User
                              </Button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddParticipants}
                      disabled={selectedUsers.length === 0 || nonParticipants.length === 0}
                    >
                      Add Participants
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="py-2 sm:py-4">
            <p className="text-xl sm:text-3xl font-bold">{participants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="py-2 sm:py-4">
            <p className="text-xl sm:text-3xl font-bold">{gatheringExpenses.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="mb-4 sm:mb-8">
        <TabsList className="w-full grid grid-cols-4 h-auto">
          <TabsTrigger value="expenses" className="py-2 text-sm sm:text-base">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="settlements" className="py-2 text-sm sm:text-base">
            Settlements
          </TabsTrigger>
          <TabsTrigger value="resume" className="py-2 text-sm sm:text-base">
            Resume
          </TabsTrigger>
          <TabsTrigger value="participants" className="py-2 text-sm sm:text-base">
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Expenses</h2>

            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-10 rounded-lg">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Expense</span>
                  <span className="sm:hidden">Add</span>
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
                    gatheringId={gatheringId}
                    participants={participants}
                    onSubmit={handleAddExpenseSubmit}
                    onCancel={() => setIsAddExpenseOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {gatheringExpenses.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">No expenses added yet.</p>
              <Button variant="outline" onClick={() => setIsAddExpenseOpen(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gatheringExpenses.map((expense) => {
                    const payer = users.find((u) => u.id === expense.paidById)
                    const categoryEmoji = getCategoryEmoji(expense)

                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{categoryEmoji}</span>
                            <span className="capitalize">{expense.category}</span>
                            {expense.category === "food" && (
                              <span className="text-xs text-muted-foreground">
                                {expense.isMeat ? "(meat)" : "(vegan-friendly)"}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{payer?.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        {/* Update the TableCell with the delete button to include the edit button */}
                        <TableCell>
                          <div className="flex">
                            <EditExpenseDialog
                              expense={{
                                id: expense.id,
                                description: expense.description,
                                amount: expense.amount,
                                category: expense.category,
                                paidById: expense.paidById,
                                participants: expense.participants,
                                isMeat: expense.isMeat,
                              }}
                              gatheringId={gatheringId}
                              participants={participants}
                              onSubmit={handleEditExpense}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settlements" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Settlements</h2>

          {transactions.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-muted-foreground">No settlements needed or no expenses added yet.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Alias</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => {
                    const fromUser = users.find((u) => u.id === transaction.fromUserId)
                    const toUser = users.find((u) => u.id === transaction.toUserId)
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{fromUser?.name}</TableCell>
                        <TableCell>{toUser?.name}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {toUser?.alias}
                          <CopyButton text={toUser?.alias || ""} label="Copy alias" />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <CopyButton text={transaction.amount} label="Copy payment details" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resume" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Summary</h2>
            <CopySummaryButton
              gathering={gathering}
              participants={participants}
              transactions={transactions}
              expenses={gatheringExpenses}
              users={users}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  Creditors (Receiving Money)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailedFinancialList
                  gathering={gathering}
                  participants={participants}
                  expenses={gatheringExpenses}
                  transactions={transactions}
                  type="creditor"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  Debtors (Paying Money)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailedFinancialList
                  gathering={gathering}
                  participants={participants}
                  expenses={gatheringExpenses}
                  transactions={transactions}
                  type="debtor"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseDistributionChart
                gathering={gathering}
                participants={participants}
                expenses={gatheringExpenses}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Participants</h2>
            <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Participants
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Preferences</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.alias}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.preferences.isVegan ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Vegan 🌱
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            Non-vegan 🍖
                          </span>
                        )}
                        {user.preferences.participatesInHerb ? (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            Herb 🌿
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            No Herb 🚭
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Button variant="destructive" onClick={handleDeleteGathering} className="h-10 rounded-lg">
        Delete Gathering
      </Button>
    </div>
  )
}

function DetailedFinancialList({ gathering, participants, expenses, transactions, type }) {
  const { users } = useStore()

  // Use the new function to calculate participant finances
  const participantFinances = calculateParticipantFinances(participants, expenses, transactions)

  // Filter based on type
  const filteredParticipants = participantFinances.filter((p) => (type === "creditor" ? p.isCreditor : p.isDebtor))

  if (filteredParticipants.length === 0) {
    return (
      <div className="text-center p-4 bg-muted rounded-md">
        <p className="text-muted-foreground">No {type}s in this gathering.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredParticipants.map((finance) => (
        <Collapsible key={finance.participant.id} className="border rounded-lg shadow-sm">
          <div className="p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{finance.participant.name}</h3>
              <div
                className={`font-semibold ${type === "creditor" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {type === "creditor"
                  ? `Receives ${formatCurrency(finance.amountOwedToThem)}`
                  : `Pays ${formatCurrency(finance.amountOwed)}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Paid:</span> {formatCurrency(finance.amountPaid)}
              </div>

              <div>
                <span className="text-muted-foreground">Total Gastado:</span>{" "}
                {formatCurrency(finance.totalContributions)}
                {/* <span className="text-muted-foreground">Final Balance:</span> {formatCurrency(finance.finalBalance)} */}
              </div>
            </div>

            <CollapsibleTrigger className="w-full flex items-center justify-center mt-2 pt-2 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Show Details</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {finance.paidExpenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Expenses Paid:</h4>
                  <ul className="text-sm space-y-1 pl-4">
                    {finance.paidExpenses.map((expense) => (
                      <li key={expense.id} className="flex justify-between">
                        <span>{expense.description}</span>
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-1">Expense Contributions:</h4>
                <ul className="text-sm space-y-1 pl-4">
                  {finance.expenseContributions
                    .filter((item) => item.contribution > 0)
                    .map(({ expense, contribution }) => (
                      <li key={expense.id} className="flex justify-between">
                        <span>{expense.description}</span>
                        <span className="font-medium">{formatCurrency(contribution)}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Net Amount:</span>
                    <span>{formatCurrency(finance.totalContributions)}</span>
                  </div>
                </div> */}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}

function ExpenseDistributionChart({ gathering, participants, expenses }) {
  const { users } = useStore()

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate expenses per participant
  const participantExpenses = participants
    .map((participant) => {
      const paidExpenses = expenses
        .filter((expense) => expense.paidById === participant.id)
        .reduce((sum, expense) => sum + expense.amount, 0)

      const percentage = totalExpenses > 0 ? (paidExpenses / totalExpenses) * 100 : 0

      return {
        participant,
        paidExpenses,
        percentage,
      }
    })
    .sort((a, b) => b.paidExpenses - a.paidExpenses)

  return (
    <div className="space-y-2 sm:space-y-4">
      {participantExpenses.map(({ participant, paidExpenses, percentage }) => (
        <div key={participant.id} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{participant.name}</span>
            <span>
              {formatCurrency(paidExpenses)} ({percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CopySummaryButton({ gathering, participants, transactions, expenses, users }) {
  const [copied, setCopied] = useState(false)
  const summaryRef = useRef(null)

  const generateSummary = () => {
    // Use the new function to calculate participant finances
    const participantFinances = calculateParticipantFinances(participants, expenses, transactions)

    // Generate the summary text
    let summary = `💰 EXPENSE SUMMARY: ${gathering.title.toUpperCase()} 💰\n`
    summary += `Date: ${formatDisplayDate(gathering.date)}\n`
    summary += `Total: ${formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}\n\n`

    // Add expense breakdown
    summary += `📋 EXPENSES:\n`
    expenses.forEach((expense) => {
      const payer = users.find((u) => u.id === expense.paidById)

      const categoryEmoji =
        expense.category === "food" ? (expense.isMeat ? "🍖" : "🌱") : expense.category === "herb" ? "🌿" : "📦"

      const categoryLabel =
        expense.category === "food" && expense.isMeat
          ? "Food (meat)"
          : expense.category === "food"
            ? "Food (vegan-friendly)"
            : expense.category

      summary += `- ${categoryEmoji} ${expense.description}: ${formatCurrency(expense.amount)} (${categoryLabel}, paid by ${payer?.name})\n`

      // Add participants for this expense
      const participantNames = expense.participants.map((id) => {
        const user = users.find((u) => u.id === id)
        return user ? user.name : "Unknown"
      })

      summary += `  Participants: ${participantNames.join(", ")}\n`
      summary += `  Per person: ${formatCurrency(expense.amount / expense.participants.length)}\n`
    })

    summary += `\n💸 WHO PAYS WHOM:\n`
    if (transactions.length === 0) {
      summary += `No payments needed.\n`
    } else {
      transactions.forEach((transaction) => {
        const fromUser = users.find((u) => u.id === transaction.fromUserId)
        const toUser = users.find((u) => u.id === transaction.toUserId)
        summary += `- ${fromUser?.name} pays ${formatCurrency(transaction.amount)} to ${toUser?.name} (${toUser?.alias})\n`
      })
    }

    summary += `\n📊 PARTICIPANT SUMMARY:\n`
    participantFinances.forEach(
      ({ participant, amountPaid, amountOwed, amountOwedToThem, finalBalance, expenseContributions }) => {
        summary += `- ${participant.name}:\n`

        // Show what they paid
        if (amountPaid > 0) {
          summary += `  Paid: ${formatCurrency(amountPaid)}\n`
        }

        // Show final balance
        summary += `  Final Balance: ${formatCurrency(finalBalance)}\n`

        // Show expense contributions
        if (expenseContributions.length > 0) {
          summary += `  Contributed to:\n`
          expenseContributions.forEach(({ expense, contribution }) => {
            summary += `    - ${formatCurrency(contribution)} for "${expense.description}"\n`
          })
        }

        // Show settlement info
        if (amountOwedToThem > 0) {
          summary += `  Receives: ${formatCurrency(amountOwedToThem)}\n`
        } else if (amountOwed > 0) {
          summary += `  Pays: ${formatCurrency(amountOwed)}\n`
        }

        summary += `\n`
                
      },
    )

    return summary += `Podes ver mas detalle en 🔗: https://gasto-que-si-campeon.vercel.app/gatherings`

  }

  const handleCopy = async () => {
    const summary = generateSummary()

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
      // Fallback for browsers that don't support clipboard API
      if (summaryRef.current) {
        summaryRef.current.value = summary
        summaryRef.current.select()
        document.execCommand("copy")
      }
    }
  }

  return (
    <>
      <ShareButton text={generateSummary()} />

      <Button variant="outline" size="sm" className="gap-1" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Summary
          </>
        )}
      </Button>

      <textarea ref={summaryRef} className="sr-only" readOnly tabIndex={-1} aria-hidden="true" />
    </>
  )
}

