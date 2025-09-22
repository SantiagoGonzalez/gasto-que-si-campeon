"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowRight } from "lucide-react"
import { useStore } from "@/lib/store"
import { format, parseISO } from "date-fns"
import { useState } from "react"

export default function Home() {
  const { gatherings, expenses, users } = useStore()
  const [fadedCards, setFadedCards] = useState<{ [key: string]: boolean }>({})

  // Get the 3 most recent gatherings
  const recentGatherings = [...gatherings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((gathering) => {
      const gatheringExpenses = expenses.filter((e) => e.gatheringId === gathering.id)
      const totalExpenses = gatheringExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const participantCount = gathering.participants.length

      return {
        ...gathering,
        totalExpenses,
        participantCount,
      }
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleCardClick = (cardId: string) => {
    setFadedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Gasto que si Campeon</h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-8">
            Easily split expenses among friends with dietary preferences and custom participation
          </p>
          <Link href="/gatherings/new">
            <Button size="lg" className="gap-2 h-10 sm:h-12 rounded-lg">
              <PlusCircle className="h-5 w-5" />
              New Gathering
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2">
          <div
            className={`bg-card rounded-lg p-4 sm:p-6 shadow-sm border cursor-pointer transition-opacity duration-300 ease-in-out ${fadedCards["card1"] ? "opacity-0 max-h-0" : "opacity-100"}`}
            onClick={() => handleCardClick("card1")}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Smart Expense Splitting</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Automatically handles dietary preferences. Vegans don't pay for meat, and only participants contribute to
              shared items.
            </p>
          </div>
          <div
            className={`bg-card rounded-lg p-4 sm:p-6 shadow-sm border cursor-pointer transition-opacity duration-300 ease-in-out ${fadedCards["card2"] ? "opacity-0 max-h-0" : "opacity-100"}`}
            onClick={() => handleCardClick("card2")}
          >
            <h2 className="text-xl font-semibold mb-3">Optimized Payments</h2>
            <p className="text-muted-foreground">
              Minimizes the number of transactions needed to settle debts, making it easier for everyone to pay what
              they owe.
            </p>
          </div>
          <div
            className={`bg-card rounded-lg p-4 sm:p-6 shadow-sm border cursor-pointer transition-opacity duration-300 ease-in-out ${fadedCards["card3"] ? "opacity-0 max-h-0" : "opacity-100"}`}
            onClick={() => handleCardClick("card3")}
          >
            <h2 className="text-xl font-semibold mb-3">Meeting-Based System</h2>
            <p className="text-muted-foreground">
              Create separate gatherings for different events, with varying participants and expense categories.
            </p>
          </div>
          <div
            className={`bg-card rounded-lg p-4 sm:p-6 shadow-sm border cursor-pointer transition-opacity duration-300 ease-in-out ${fadedCards["card4"] ? "opacity-0 max-h-0" : "opacity-100"}`}
            onClick={() => handleCardClick("card4")}
          >
            <h2 className="text-xl font-semibold mb-3">User Management</h2>
            <p className="text-muted-foreground">
              Add friends with their names, aliases, and preferences. Easily manage who's participating in each
              gathering.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Gatherings</h2>
            <Link href="/gatherings">
              <Button variant="ghost" className="gap-1 h-9 rounded-lg">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentGatherings.length === 0 ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No gatherings yet. Create your first one!</p>
              <Link href="/gatherings/new">
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <PlusCircle className="h-5 w-5" />
                  New Gathering
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {recentGatherings.map((gathering) => (
                <Link href={`/gatherings/${gathering.id}`} key={gathering.id} className="block">
                  <div className="bg-card rounded-lg p-4 sm:p-5 shadow-sm border hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">{gathering.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">
                      {format(parseISO(gathering.date), "MMMM yyyy")}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">
                        {gathering.participantCount} {gathering.participantCount === 1 ? "person" : "people"}
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {formatCurrency(gathering.totalExpenses)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
