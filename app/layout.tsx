import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClearCue - AI-Powered Skincare Consultation",
  description: "Get personalized skincare analysis and recommendations powered by advanced AI technology",
  keywords: ["skincare", "AI", "dermatology", "skin analysis", "beauty", "consultation"],
  authors: [{ name: "Enigma's" }],
  creator: "Enigma's",
  openGraph: {
    title: "ClearCue - AI-Powered Skincare Consultation",
    description: "Get personalized skincare analysis and recommendations powered by advanced AI technology",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearCue - AI-Powered Skincare Consultation",
    description: "Get personalized skincare analysis and recommendations powered by advanced AI technology",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
