"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabaseAdmin } from "./supabase"

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
  isLoading: boolean
  error: string | null

  // User actions
  fetchUsers: () => Promise<void>
  addUser: (user: Omit<User, "id"> & { id?: string }) => Promise<string>
  updateUser: (id: string, user: Partial<Omit<User, "id">>) => Promise<void>
  removeUser: (id: string) => Promise<void>

  // Gathering actions
  fetchGatherings: () => Promise<void>
  addGathering: (gathering: Omit<Gathering, "id">) => Promise<string>
  updateGathering: (id: string, gathering: Partial<Omit<Gathering, "id">>) => Promise<void>
  removeGathering: (id: string) => Promise<void>

  // Expense actions
  fetchExpenses: () => Promise<void>
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>
  updateExpense: (id: string, expense: Partial<Omit<Expense, "id">>) => Promise<void>
  removeExpense: (id: string) => Promise<void>

  // Calculation methods
  calculateDebts: (gatheringId: string) => Transaction[]
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      users: [],
      gatherings: [],
      expenses: [],
      isLoading: false,
      error: null,

      fetchUsers: async () => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { data, error } = await supabaseAdmin.from("users").select("*")

          if (error) throw error

          const formattedUsers: User[] = data.map((user) => ({
            id: user.id,
            name: user.name,
            alias: user.alias,
            preferences: {
              isVegan: user.is_vegan,
              participatesInHerb: user.participates_in_herb,
            },
          }))

          set({ users: formattedUsers, isLoading: false })
        } catch (error: any) {
          console.error("Error fetching users:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      addUser: async (user) => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { data, error } = await supabaseAdmin
            .from("users")
            .insert({
              id: user.id,
              name: user.name,
              alias: user.alias || user.name.split(" ")[0],
              is_vegan: user.preferences.isVegan,
              participates_in_herb: user.preferences.participatesInHerb,
            })
            .select()

          if (error) throw error

          const newUser: User = {
            id: data[0].id,
            name: data[0].name,
            alias: data[0].alias,
            preferences: {
              isVegan: data[0].is_vegan,
              participatesInHerb: data[0].participates_in_herb,
            },
          }

          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false,
          }))

          return newUser.id
        } catch (error: any) {
          console.error("Error adding user:", error)
          set({ error: error.message, isLoading: false })
          return ""
        }
      },

      updateUser: async (id, user) => {
        set({ isLoading: true, error: null })
        try {
          const updateData: any = {}

          if (user.name) updateData.name = user.name
          if (user.alias) updateData.alias = user.alias
          if (user.preferences) {
            if (user.preferences.isVegan !== undefined) updateData.is_vegan = user.preferences.isVegan
            if (user.preferences.participatesInHerb !== undefined)
              updateData.participates_in_herb = user.preferences.participatesInHerb
          }

          // Use admin client to bypass RLS
          const { error } = await supabaseAdmin.from("users").update(updateData).eq("id", id)

          if (error) throw error

          set((state) => ({
            users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error updating user:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      removeUser: async (id) => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { error } = await supabaseAdmin.from("users").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            users: state.users.filter((u) => u.id !== id),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error removing user:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      fetchGatherings: async () => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { data: gatheringsData, error: gatheringsError } = await supabaseAdmin.from("gatherings").select("*")

          if (gatheringsError) throw gatheringsError

          // Fetch gathering participants
          const { data: participantsData, error: participantsError } = await supabaseAdmin
            .from("gathering_participants")
            .select("*")

          if (participantsError) throw participantsError

          // Group participants by gathering
          const participantsByGathering: Record<string, string[]> = {}
          participantsData.forEach((p) => {
            if (!participantsByGathering[p.gathering_id]) {
              participantsByGathering[p.gathering_id] = []
            }
            participantsByGathering[p.gathering_id].push(p.user_id)
          })

          // Format gatherings with participants
          const formattedGatherings: Gathering[] = gatheringsData.map((g) => ({
            id: g.id,
            title: g.title,
            date: g.date,
            hostId: g.host_id || undefined,
            participants: participantsByGathering[g.id] || [],
          }))

          set({ gatherings: formattedGatherings, isLoading: false })
        } catch (error: any) {
          console.error("Error fetching gatherings:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      addGathering: async (gathering) => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { data: gatheringData, error: gatheringError } = await supabaseAdmin
            .from("gatherings")
            .insert({
              title: gathering.title,
              date: gathering.date,
              host_id: gathering.hostId,
            })
            .select()

          if (gatheringError) throw gatheringError

          const gatheringId = gatheringData[0].id

          // Insert participants
          const participantsToInsert = gathering.participants.map((userId) => ({
            gathering_id: gatheringId,
            user_id: userId,
          }))

          if (participantsToInsert.length > 0) {
            const { error: participantsError } = await supabaseAdmin
              .from("gathering_participants")
              .insert(participantsToInsert)

            if (participantsError) throw participantsError
          }

          const newGathering: Gathering = {
            id: gatheringId,
            title: gathering.title,
            date: gathering.date,
            participants: gathering.participants,
            hostId: gathering.hostId,
          }

          set((state) => ({
            gatherings: [...state.gatherings, newGathering],
            isLoading: false,
          }))

          return gatheringId
        } catch (error: any) {
          console.error("Error adding gathering:", error)
          set({ error: error.message, isLoading: false })
          return ""
        }
      },

      updateGathering: async (id, gathering) => {
        set({ isLoading: true, error: null })
        try {
          const updateData: any = {}

          if (gathering.title) updateData.title = gathering.title
          if (gathering.date) updateData.date = gathering.date
          if (gathering.hostId !== undefined) updateData.host_id = gathering.hostId

          // Update gathering
          if (Object.keys(updateData).length > 0) {
            const { error: gatheringError } = await supabaseAdmin.from("gatherings").update(updateData).eq("id", id)

            if (gatheringError) throw gatheringError
          }

          // Update participants if provided
          if (gathering.participants) {
            // Delete existing participants
            const { error: deleteError } = await supabaseAdmin
              .from("gathering_participants")
              .delete()
              .eq("gathering_id", id)

            if (deleteError) throw deleteError

            // Insert new participants
            const participantsToInsert = gathering.participants.map((userId) => ({
              gathering_id: id,
              user_id: userId,
            }))

            if (participantsToInsert.length > 0) {
              const { error: insertError } = await supabaseAdmin
                .from("gathering_participants")
                .insert(participantsToInsert)

              if (insertError) throw insertError
            }
          }

          set((state) => ({
            gatherings: state.gatherings.map((g) => (g.id === id ? { ...g, ...gathering } : g)),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error updating gathering:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      removeGathering: async (id) => {
        set({ isLoading: true, error: null })
        try {
          // Delete gathering (cascade will handle participants and expenses)
          const { error } = await supabaseAdmin.from("gatherings").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            gatherings: state.gatherings.filter((g) => g.id !== id),
            expenses: state.expenses.filter((e) => e.gatheringId !== id),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error removing gathering:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      fetchExpenses: async () => {
        set({ isLoading: true, error: null })
        try {
          // Use admin client to bypass RLS
          const { data: expensesData, error: expensesError } = await supabaseAdmin.from("expenses").select("*")

          if (expensesError) throw expensesError

          // Fetch expense participants
          const { data: participantsData, error: participantsError } = await supabaseAdmin
            .from("expense_participants")
            .select("*")

          if (participantsError) throw participantsError

          // Group participants by expense
          const participantsByExpense: Record<string, string[]> = {}
          participantsData.forEach((p) => {
            if (!participantsByExpense[p.expense_id]) {
              participantsByExpense[p.expense_id] = []
            }
            participantsByExpense[p.expense_id].push(p.user_id)
          })

          // Format expenses with participants
          const formattedExpenses: Expense[] = expensesData.map((e) => ({
            id: e.id,
            gatheringId: e.gathering_id,
            description: e.description,
            amount: e.amount,
            category: e.category as ExpenseCategory,
            paidById: e.paid_by_id,
            participants: participantsByExpense[e.id] || [],
            date: e.date,
            isMeat: e.is_meat || false,
          }))

          set({ expenses: formattedExpenses, isLoading: false })
        } catch (error: any) {
          console.error("Error fetching expenses:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      addExpense: async (expense) => {
        set({ isLoading: true, error: null })
        try {
          // Validate IDs
          if (!expense.gatheringId || typeof expense.gatheringId !== "string") {
            throw new Error("Invalid gathering ID")
          }

          if (!expense.paidById || typeof expense.paidById !== "string") {
            throw new Error("Invalid payer ID")
          }

          // Validate participants
          if (!Array.isArray(expense.participants) || expense.participants.length === 0) {
            throw new Error("At least one participant is required")
          }

          // Filter out any invalid participant IDs
          const validParticipants = expense.participants.filter((id) => id && typeof id === "string")

          if (validParticipants.length === 0) {
            throw new Error("No valid participants provided")
          }

          // Use admin client to bypass RLS
          const { data: expenseData, error: expenseError } = await supabaseAdmin
            .from("expenses")
            .insert({
              gathering_id: expense.gatheringId,
              description: expense.description,
              amount: expense.amount,
              category: expense.category,
              paid_by_id: expense.paidById,
              is_meat: expense.category === "food" ? expense.isMeat : null,
              date: expense.date,
            })
            .select()

          if (expenseError) throw expenseError

          const expenseId = expenseData[0].id

          // Insert participants
          const participantsToInsert = validParticipants.map((userId) => ({
            expense_id: expenseId,
            user_id: userId,
          }))

          if (participantsToInsert.length > 0) {
            const { error: participantsError } = await supabaseAdmin
              .from("expense_participants")
              .insert(participantsToInsert)

            if (participantsError) throw participantsError
          }

          const newExpense: Expense = {
            id: expenseId,
            gatheringId: expense.gatheringId,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            paidById: expense.paidById,
            participants: validParticipants,
            date: expense.date,
            isMeat: expense.category === "food" ? expense.isMeat : undefined,
          }

          set((state) => ({
            expenses: [...state.expenses, newExpense],
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error adding expense:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      updateExpense: async (id, expense) => {
        set({ isLoading: true, error: null })
        try {
          const updateData: any = {}

          if (expense.description) updateData.description = expense.description
          if (expense.amount !== undefined) updateData.amount = expense.amount
          if (expense.category) updateData.category = expense.category
          if (expense.paidById) updateData.paid_by_id = expense.paidById
          if (expense.date) updateData.date = expense.date
          if (expense.category === "food" && expense.isMeat !== undefined) {
            updateData.is_meat = expense.isMeat
          }

          // Update expense
          if (Object.keys(updateData).length > 0) {
            const { error: expenseError } = await supabaseAdmin.from("expenses").update(updateData).eq("id", id)

            if (expenseError) throw expenseError
          }

          // Update participants if provided
          if (expense.participants) {
            // Delete existing participants
            const { error: deleteError } = await supabaseAdmin
              .from("expense_participants")
              .delete()
              .eq("expense_id", id)

            if (deleteError) throw deleteError

            // Insert new participants
            const participantsToInsert = expense.participants.map((userId) => ({
              expense_id: id,
              user_id: userId,
            }))

            if (participantsToInsert.length > 0) {
              const { error: insertError } = await supabaseAdmin
                .from("expense_participants")
                .insert(participantsToInsert)

              if (insertError) throw insertError
            }
          }

          set((state) => ({
            expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error updating expense:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      removeExpense: async (id) => {
        set({ isLoading: true, error: null })
        try {
          // Delete expense (cascade will handle participants)
          const { error } = await supabaseAdmin.from("expenses").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error("Error removing expense:", error)
          set({ error: error.message, isLoading: false })
        }
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
      partialize: (state) => ({
        users: state.users,
        gatherings: state.gatherings,
        expenses: state.expenses,
      }),
    },
  ),
)

