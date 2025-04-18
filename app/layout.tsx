import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { DataLoader } from "@/components/data-loader"

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "Gasto que si Campeon (beta)",
  description: "Easily split expenses among friends with dietary preferences",
  icons: {
    icon: "/favicon-32x32.png",
  },
    generator: 'v0.dev'
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataLoader />
          <Navbar />
          <main>{children}</main>

          <footer className="text-center text-muted-foreground py-1">
            <p className="text-sm">&copy; 2025 GQSC. Provided by GG. All rights reserved.</p>
            <p className="text-xs">&#9888; This app is currently in beta. Some features may not work as expected &#9888;</p>

          </footer>

        </ThemeProvider>
      </body>
    </html>
  )
}

