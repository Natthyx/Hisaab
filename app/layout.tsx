import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"

const geistSans = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Hisaab - Manage Your Finances",
  description: "Take control of your finances with beautiful expense tracking, advanced analytics, and smart insights.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}