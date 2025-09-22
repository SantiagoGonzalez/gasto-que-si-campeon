"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserPreferences = {
  isVegan: boolean
  participatesInHerb: boolean
}

export type User = {
  id: string
  name: string
  alias: string
  preferences: UserPreferences
}

export type ExpenseCategory = "food" | "herb" | "other"

export type Expense = {
  id: string
  gatheringId: string
  description: string
  amount: number
  category: ExpenseCategory
  paidById: string
  participants: string[] // User IDs
  date: string
  isMeat?: boolean // Add flag to track meat-based food expenses
}

// Update the Gathering type to include a host field
export type Gathering = {
  id: string
  title: string
  date: string
  participants: string[] // User IDs
  hostId?: string // Optional host user ID
}

export type Transaction = {
  fromUserId: string
  toUserId: string
  amount: number
}

type Store = {
  users: User[]
  gatherings: Gathering[]
  expenses: Expense[]

  // User actions
  addUser: (user: Omit<User, "id"> & { id?: string }) => string
  updateUser: (id: string, user: Partial<Omit<User, "id">>) => void
  removeUser: (id: string) => void

  // Gathering actions
  // Update the addGathering function to include the hostId parameter
  addGathering: (gathering: Omit<Gathering, "id">) => string
  updateGathering: (id: string, gathering: Partial<Omit<Gathering, "id">>) => void
  removeGathering: (id: string) => void

  // Expense actions
  addExpense: (expense: Omit<Expense, "id">) => void
  updateExpense: (id: string, expense: Partial<Omit<Expense, "id">>) => void
  removeExpense: (id: string) => void

  // Calculation methods
  calculateDebts: (gatheringId: string) => Transaction[]
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      users: [],
      gatherings: [],
      expenses: [],

      addUser: (user) => {
        const id = user.id || crypto.randomUUID()
        set((state) => ({
          users: [...state.users, { ...user, id }],
        }))
        return id
      },

      updateUser: (id, user) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)),
        }))
      },

      removeUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },

      addGathering: (gathering) => {
        const id = crypto.randomUUID()
        set((state) => ({
          gatherings: [...state.gatherings, { ...gathering, id }],
        }))
        return id
      },

      updateGathering: (id, gathering) => {
        set((state) => ({
          gatherings: state.gatherings.map((g) => (g.id === id ? { ...g, ...gathering } : g)),
        }))
      },

      removeGathering: (id) => {
        set((state) => ({
          gatherings: state.gatherings.filter((g) => g.id !== id),
          expenses: state.expenses.filter((e) => e.gatheringId !== id),
        }))
      },

      addExpense: (expense) => {
        const id = crypto.randomUUID()
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id }],
        }))
      },

      updateExpense: (id, expense) => {
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
        }))
      },

      removeExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }))
      },

      calculateDebts: (gatheringId) => {
        const { users, expenses, gatherings } = get()
        const gathering = gatherings.find((g) => g.id === gatheringId)

        if (!gathering) return []

        const gatheringExpenses = expenses.filter((e) => e.gatheringId === gatheringId)

        // Calculate how much each person has paid and owes
        const balances: Record<string, number> = {}

        // Initialize balances for all participants
        gathering.participants.forEach((userId) => {
          balances[userId] = 0
        })

        // Process each expense
        gatheringExpenses.forEach((expense) => {
          const payer = expense.paidById
          const eligibleParticipants = expense.participants.filter((userId) => {
            // If it's a food expense, check if the user is vegan and the expense is for meat
            if (expense.category === "food" && expense.isMeat) {
              const user = users.find((u) => u.id === userId)
              // Only exclude vegans from meat-based food expenses
              if (user?.preferences.isVegan) {
                return false
              }
            }

            // If it's a herb expense, check if the user participates in herb expenses
            if (expense.category === "herb") {
              const user = users.find((u) => u.id === userId)
              if (!user?.preferences.participatesInHerb) {
                return false
              }
            }

            return true
          })

          // Calculate the share amount per participant (including the payer)
          const shareAmount = expense.amount / eligibleParticipants.length

          // Credit the payer for the full amount
          balances[payer] += expense.amount

          // Debit each participant (including the payer) for their share
          eligibleParticipants.forEach((userId) => {
            balances[userId] -= shareAmount
          })
        })

        // Separate creditors and debtors
        const creditors: { id: string; amount: number }[] = []
        const debtors: { id: string; amount: number }[] = []

        Object.entries(balances).forEach(([userId, balance]) => {
          if (balance > 0) {
            creditors.push({ id: userId, amount: balance })
          } else if (balance < 0) {
            debtors.push({ id: userId, amount: -balance })
          }
        })

        // Sort by amount (descending)
        creditors.sort((a, b) => b.amount - a.amount)
        debtors.sort((a, b) => b.amount - a.amount)

        // Generate transactions
        const transactions: Transaction[] = []

        while (creditors.length > 0 && debtors.length > 0) {
          const creditor = creditors[0]
          const debtor = debtors[0]

          const amount = Math.min(creditor.amount, debtor.amount)

          transactions.push({
            fromUserId: debtor.id,
            toUserId: creditor.id,
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
          })

          creditor.amount -= amount
          debtor.amount -= amount

          if (creditor.amount <= 0.01) creditors.shift()
          if (debtor.amount <= 0.01) debtors.shift()
        }

        return transactions
      },
    }),
    {
      name: "expense-splitter-storage",
    },
  ),
)
