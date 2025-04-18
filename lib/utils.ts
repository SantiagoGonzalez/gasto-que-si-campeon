import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "./store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserEmojis(user: User): string {
  const emojis = []

  // Vegan status
  if (user.preferences.isVegan) {
    emojis.push("🌱")
  } else {
    emojis.push("🍖")
  }

  // Herb participation status
  if (user.preferences.participatesInHerb) {
    emojis.push("🌿")
  } else {
    emojis.push("🚭")
  }

  return emojis.join(" ")
}

