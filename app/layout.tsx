import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gasto que si Campeon",
  description: "Easily split expenses among friends with dietary preferences",
  icons: {
    icon: "/favicon-32x32.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <Navbar />

            <main>{children}</main>

            <footer className="text-center text-muted-foreground py-1">
              <p className="text-sm">&copy; 2025 GQSC. Provided by GG. All rights reserved.</p>
            </footer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
