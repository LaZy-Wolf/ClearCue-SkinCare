import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { config } from "@/lib/config"

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const mode = formData.get("mode") as string

    if (mode === "diagnosis") {
      return handleDiagnosisMode(formData)
    } else if (mode === "skincare") {
      return handleSkincareMode(formData)
    } else {
      return NextResponse.json({ error: "Invalid mode specified" }, { status: 400 })
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze. Please try again or contact support." }, { status: 500 })
  }
}

async function handleDiagnosisMode(formData: FormData) {
  const description = JSON.parse(formData.get("description") as string)

  // Get uploaded images
  const images = []
  for (let i = 0; i < 4; i++) {
    const image = formData.get(`image${i}`) as File
    if (image) {
      const bytes = await image.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      images.push({
        inlineData: {
          data: base64,
          mimeType: image.type,
        },
      })
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const prompt = `
  You are a professional dermatologist AI assistant. Analyze the provided skin images and description to provide a comprehensive skin consultation.

  Patient Description:
  - Appearance: ${description.appearance || "Not provided"}
  - Issue: ${description.issue || "Not provided"}
  - How/when it started: ${description.started || "Not provided"}
  - Symptoms: ${description.symptoms || "Not provided"}
  - Triggers: ${description.triggers || "Not provided"}
  - Skin type: ${description.skinType || "Not provided"}

  IMPORTANT: You must respond with ONLY a valid JSON object in exactly this format. Do not include any other text, explanations, or markdown formatting:

  {
    "diagnosis": "Clear, professional diagnosis of the skin condition",
    "cause": "Detailed explanation of what likely caused this condition",
    "treatment": ["Step 1 of treatment", "Step 2 of treatment", "Step 3 of treatment"],
    "prevention": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3"],
    "medicines": ["Medicine 1 with dosage and timing", "Medicine 2 with dosage and timing", "Medicine 3 with dosage and timing"],
    "naturalRemedies": ["Natural remedy 1 with instructions", "Natural remedy 2 with instructions", "Natural remedy 3 with instructions"],
    "products": ["Specific product recommendation 1 with brand if possible", "Specific product recommendation 2 with brand if possible", "Specific product recommendation 3 with brand if possible"]
  }

  Guidelines:
  - Be professional and thorough
  - Provide practical, actionable advice
  - Include specific medicine recommendations with dosages and timing
  - Include natural remedies that are safe and evidence-based
  - Recommend specific skincare products with brand names when possible
  - Always recommend consulting a dermatologist for serious conditions
  - Be empathetic and reassuring in tone
  - Focus on evidence-based treatments
  - Ensure all array fields have at least 3 items
  - For natural remedies, include safe home remedies like aloe vera, honey, oatmeal, etc.
  - For products, recommend well-known brands like CeraVe, Neutrogena, La Roche-Posay, etc.
  `

  const result = await model.generateContent([prompt, ...images])
  const response = await result.response
  const text = response.text().trim()

  return parseAndValidateResponse(text, "diagnosis")
}

async function handleSkincareMode(formData: FormData) {
  const skincareForm = JSON.parse(formData.get("skincareForm") as string)

  // Get uploaded image (optional)
  const images = []
  const image = formData.get("image0") as File
  if (image) {
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    images.push({
      inlineData: {
        data: base64,
        mimeType: image.type,
      },
    })
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const goalsText = skincareForm.goals
    .map((goal: string) => {
      const goalMap: { [key: string]: string } = {
        tan: "Remove Tan",
        brighten: "Brighten Skin Tone",
        blackheads: "Reduce Blackheads",
        "acne-marks": "Clear Acne Marks",
        pores: "Shrink Pores",
        "oil-control": "Control Oiliness",
        hydration: "Hydration",
        "anti-aging": "Anti-Aging",
      }
      return goalMap[goal] || goal
    })
    .join(", ")

  const prompt = `
  You are a professional skincare consultant AI. Create a personalized skincare routine based on the provided information.

  Client Information:
  - Skin Type: ${skincareForm.skinType}
  - Goals: ${goalsText}
  - Custom Goals/Concerns: ${skincareForm.customGoal || "None specified"}
  ${images.length > 0 ? "- Face image provided for analysis" : "- No image provided"}

  IMPORTANT: You must respond with ONLY a valid JSON object in exactly this format. Do not include any other text, explanations, or markdown formatting:

  {
    "skinAnalysis": "Professional analysis of the skin type and condition based on provided information and image (if available)",
    "morningRoutine": ["Morning step 1", "Morning step 2", "Morning step 3", "Morning step 4"],
    "eveningRoutine": ["Evening step 1", "Evening step 2", "Evening step 3", "Evening step 4"],
    "productRecommendations": ["Product 1 with brand and purpose", "Product 2 with brand and purpose", "Product 3 with brand and purpose", "Product 4 with brand and purpose"],
    "dietTips": ["Diet tip 1", "Diet tip 2", "Diet tip 3"],
    "lifestyleTips": ["Lifestyle tip 1", "Lifestyle tip 2", "Lifestyle tip 3"]
  }

  Guidelines:
  - Tailor recommendations specifically to the skin type and goals mentioned
  - Provide step-by-step morning and evening routines
  - Include specific product recommendations with brand names (CeraVe, Neutrogena, The Ordinary, etc.)
  - Give practical diet advice for skin health
  - Include lifestyle tips (sleep, stress management, hydration, etc.)
  - Be professional and evidence-based
  - Ensure all array fields have at least 3-4 items
  - Consider the specific goals mentioned (tan removal, brightening, etc.)
  - If image is provided, incorporate visual analysis into skin assessment
  `

  const result = await model.generateContent([prompt, ...images])
  const response = await result.response
  const text = response.text().trim()

  return parseAndValidateResponse(text, "skincare")
}

function parseAndValidateResponse(text: string, mode: string) {
  // Clean up the response to extract only the JSON
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "")

  // Find the JSON object in the response
  const jsonStart = text.indexOf("{")
  const jsonEnd = text.lastIndexOf("}") + 1

  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error("No valid JSON found in response")
  }

  const jsonText = text.substring(jsonStart, jsonEnd)

  try {
    const analysisData = JSON.parse(jsonText)

    if (mode === "diagnosis") {
      // Validate diagnosis structure
      if (
        !analysisData.diagnosis ||
        !analysisData.cause ||
        !Array.isArray(analysisData.treatment) ||
        !Array.isArray(analysisData.prevention) ||
        !Array.isArray(analysisData.medicines) ||
        !Array.isArray(analysisData.naturalRemedies) ||
        !Array.isArray(analysisData.products)
      ) {
        throw new Error("Invalid diagnosis response structure")
      }
    } else if (mode === "skincare") {
      // Validate skincare structure
      if (
        !analysisData.skinAnalysis ||
        !Array.isArray(analysisData.morningRoutine) ||
        !Array.isArray(analysisData.eveningRoutine) ||
        !Array.isArray(analysisData.productRecommendations) ||
        !Array.isArray(analysisData.dietTips) ||
        !Array.isArray(analysisData.lifestyleTips)
      ) {
        throw new Error("Invalid skincare response structure")
      }
    }

    return NextResponse.json(analysisData)
  } catch (parseError) {
    console.error("JSON parsing error:", parseError)
    console.error("Raw response:", text)

    // Fallback responses
    if (mode === "diagnosis") {
      return NextResponse.json({
        diagnosis:
          "Based on the images provided, this appears to be a common skin condition that would benefit from professional evaluation.",
        cause:
          "The exact cause may vary, but common factors include genetics, environmental factors, hormonal changes, or skincare routine.",
        treatment: [
          "Maintain a gentle skincare routine with mild, fragrance-free products",
          "Keep the affected area clean and dry",
          "Avoid picking or scratching the area",
          "Consider using over-the-counter treatments as appropriate",
        ],
        prevention: [
          "Use sunscreen daily to protect your skin",
          "Maintain a consistent skincare routine",
          "Stay hydrated and eat a balanced diet",
          "Avoid known triggers and irritants",
        ],
        medicines: [
          "Gentle cleanser - Use twice daily, morning and evening",
          "Moisturizer - Apply after cleansing to maintain skin barrier",
          "Consult a dermatologist for prescription treatments if needed",
        ],
        naturalRemedies: [
          "Aloe vera gel - Apply pure aloe vera gel 2-3 times daily for soothing relief",
          "Honey mask - Apply raw honey for 15-20 minutes, then rinse with warm water",
          "Oatmeal bath - Add colloidal oatmeal to lukewarm bath water for gentle cleansing",
        ],
        products: [
          "CeraVe Hydrating Cleanser - Gentle, non-comedogenic daily cleanser",
          "Neutrogena Ultra Gentle Daily Cleanser - For sensitive skin types",
          "La Roche-Posay Toleriane Double Repair Moisturizer - Fragrance-free daily moisturizer",
        ],
      })
    } else {
      return NextResponse.json({
        skinAnalysis:
          "Based on your skin type and goals, here's a personalized skincare plan to help you achieve healthier, more radiant skin.",
        morningRoutine: [
          "Gentle cleanser - Remove overnight buildup",
          "Vitamin C serum - Antioxidant protection and brightening",
          "Moisturizer - Hydrate and protect skin barrier",
          "Broad-spectrum SPF 30+ sunscreen - Essential UV protection",
        ],
        eveningRoutine: [
          "Double cleanse - Remove makeup and daily impurities",
          "Treatment serum - Target specific concerns",
          "Night moisturizer - Repair and regenerate overnight",
          "Face oil (optional) - Extra nourishment for dry skin",
        ],
        productRecommendations: [
          "CeraVe Foaming Facial Cleanser - Gentle daily cleanser for all skin types",
          "The Ordinary Vitamin C Suspension 23% - Brightening and antioxidant protection",
          "Neutrogena Hydra Boost Water Gel - Lightweight, hydrating moisturizer",
          "EltaMD UV Clear Broad-Spectrum SPF 46 - Excellent daily sunscreen",
        ],
        dietTips: [
          "Drink at least 8 glasses of water daily for optimal hydration",
          "Include antioxidant-rich foods like berries, leafy greens, and nuts",
          "Limit dairy and high-glycemic foods if you have acne-prone skin",
        ],
        lifestyleTips: [
          "Get 7-9 hours of quality sleep for skin repair and regeneration",
          "Manage stress through meditation, exercise, or relaxation techniques",
          "Change pillowcases regularly and avoid touching your face frequently",
        ],
      })
    }
  }
}
