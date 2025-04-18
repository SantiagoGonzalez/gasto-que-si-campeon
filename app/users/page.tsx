"use client"

import { useState } from "react"
import { useStore, type User } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { getUserEmojis } from "@/lib/utils"

export default function UsersPage() {
  const { users, addUser, updateUser, removeUser } = useStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState({
    name: "",
    alias: "",
    preferences: {
      isVegan: false,
      participatesInHerb: false,
    },
  })

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

    setIsAddDialogOpen(false)
  }

  const handleEditUser = () => {
    if (!editingUser) return

    updateUser(editingUser.id, {
      name: editingUser.name,
      alias: editingUser.alias,
      preferences: editingUser.preferences,
    })

    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      removeUser(id)
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 rounded-lg">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Add a new user with their preferences.</DialogDescription>
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No users added yet.</p>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Your First User
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="shadow-sm hover:shadow">
              <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>Alias: {user.alias}</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 py-2">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
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
                  <div className="text-sm text-muted-foreground">Emoji: {getUserEmojis(user)}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 px-3 sm:px-6 pb-3 sm:pb-6 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingUser(user)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDeleteUser(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and preferences.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-alias">Alias</Label>
                <Input
                  id="edit-alias"
                  value={editingUser.alias}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      alias: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Preferences</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isVegan"
                    checked={editingUser.preferences.isVegan}
                    onCheckedChange={(checked) =>
                      setEditingUser({
                        ...editingUser,
                        preferences: {
                          ...editingUser.preferences,
                          isVegan: checked === true,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="edit-isVegan"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vegan 🌱
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-participatesInHerb"
                    checked={editingUser.preferences.participatesInHerb}
                    onCheckedChange={(checked) =>
                      setEditingUser({
                        ...editingUser,
                        preferences: {
                          ...editingUser.preferences,
                          participatesInHerb: checked === true,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="edit-participatesInHerb"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Participates in herb expenses 🌿
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

