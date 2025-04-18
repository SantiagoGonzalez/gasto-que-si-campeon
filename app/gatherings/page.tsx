"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Use our utility file instead of direct date-fns imports
import { formatMonthYear, parseISODate } from "@/utils/date-utils"
import { PlusCircle, Search, Calendar, Users, DollarSign, MoreVertical, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"

type SortField = "date" | "title" | "expenses" | "participants"
type SortOrder = "asc" | "desc"

export default function GatheringsPage() {
  const router = useRouter()
  const { gatherings, expenses, users } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Calculate summary data for each gathering
  const gatheringsWithSummary = gatherings.map((gathering) => {
    const gatheringExpenses = expenses.filter((e) => e.gatheringId === gathering.id)
    const totalExpenses = gatheringExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const participantCount = gathering.participants.length
    const participantNames = gathering.participants
      .map((id) => users.find((u) => u.id === id)?.name || "")
      .filter(Boolean)
      .slice(0, 3)

    const hostName = gathering.hostId ? users.find((u) => u.id === gathering.hostId)?.name || "No host" : "No host"

    return {
      ...gathering,
      totalExpenses,
      participantCount,
      participantNames,
      hostName,
      expenseCount: gatheringExpenses.length,
    }
  })

  // Filter gatherings based on search query
  const filteredGatherings = gatheringsWithSummary.filter(
    (gathering) =>
      gathering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gathering.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gathering.participantNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Sort gatherings
  const sortedGatherings = [...filteredGatherings].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "expenses":
        comparison = a.totalExpenses - b.totalExpenses
        break
      case "participants":
        comparison = a.participantCount - b.participantCount
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gatherings</h1>
          <p className="text-muted-foreground">Browse and manage your expense-sharing gatherings</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gatherings..."
              className="pl-8 h-10 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => router.push("/gatherings/new")} className="gap-1 h-10 rounded-lg">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden md:inline">New Gathering</span>
            <span className="md:hidden">New</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium whitespace-nowrap">Sort by:</span>
        <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap" onClick={() => handleSort("date")}>
          <Calendar className="h-3.5 w-3.5" />
          Date
          {sortField === "date" && <ArrowUpDown className={`h-3.5 w-3.5 ${sortOrder === "asc" ? "rotate-180" : ""}`} />}
        </Button>
        <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap" onClick={() => handleSort("title")}>
          Title
          {sortField === "title" && (
            <ArrowUpDown className={`h-3.5 w-3.5 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap" onClick={() => handleSort("expenses")}>
          <DollarSign className="h-3.5 w-3.5" />
          Amount
          {sortField === "expenses" && (
            <ArrowUpDown className={`h-3.5 w-3.5 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 whitespace-nowrap"
          onClick={() => handleSort("participants")}
        >
          <Users className="h-3.5 w-3.5" />
          People
          {sortField === "participants" && (
            <ArrowUpDown className={`h-3.5 w-3.5 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
      </div>

      {sortedGatherings.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No gatherings found</h3>
          {searchQuery ? (
            <p className="text-muted-foreground mb-4">No gatherings match your search. Try a different search term.</p>
          ) : (
            <p className="text-muted-foreground mb-4">
              You haven't created any gatherings yet. Get started by creating your first one!
            </p>
          )}
          <Button onClick={() => router.push("/gatherings/new")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Your First Gathering
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedGatherings.map((gathering) => (
            <Card key={gathering.id} className="overflow-hidden shadow-sm hover:shadow">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{gathering.title}</CardTitle>
                    <CardDescription>{formatMonthYear(parseISODate(gathering.date))}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/gatherings/${gathering.id}`)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/gatherings/${gathering.id}?tab=settlements`)}>
                        View settlements
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="font-medium">{formatCurrency(gathering.totalExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Host</p>
                    <p className="font-medium line-clamp-1">{gathering.hostName}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Participants ({gathering.participantCount})</p>
                  <div className="flex flex-wrap gap-1">
                    {gathering.participantNames.map((name, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                        {name}
                      </span>
                    ))}
                    {gathering.participantCount > 3 && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                        +{gathering.participantCount - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-muted-foreground">
                    {gathering.expenseCount} expense{gathering.expenseCount !== 1 ? "s" : ""}
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto h-9 rounded-lg">
                    <Link href={`/gatherings/${gathering.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

