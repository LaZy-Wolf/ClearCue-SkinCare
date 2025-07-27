export const config = {
  gemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyBp0KU4R6VbpM66LhI_GwZpdC8FcM_fDUg",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    name: "ClearCue",
    description: "AI-Powered Skincare Consultation Platform",
  },
} as const

// Validate required environment variables
if (!config.gemini.apiKey) {
  throw new Error("GOOGLE_GEMINI_API_KEY is required")
}
