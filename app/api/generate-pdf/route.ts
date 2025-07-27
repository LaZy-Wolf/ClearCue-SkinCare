import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const { mode, analysis, skincareResult, description, skincareForm } = await request.json()

    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(99, 102, 241) // Indigo color
    doc.text("ClearCue", 20, 25)

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    const title = mode === "diagnosis" ? "Skin Diagnosis Report" : "Personalized Skincare Plan"
    doc.text(title, 20, 35)

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

    let yPosition = 55

    if (mode === "diagnosis" && analysis) {
      // Medical disclaimer
      doc.setFontSize(11)
      doc.setTextColor(245, 158, 11)
      doc.text("IMPORTANT MEDICAL DISCLAIMER", 20, yPosition)
      yPosition += 8

      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      const disclaimerText = doc.splitTextToSize(
        "This AI analysis is for informational purposes only and should not replace professional medical advice. For persistent, severe, or concerning skin conditions, please consult a qualified dermatologist or healthcare provider.",
        170,
      )
      doc.text(disclaimerText, 20, yPosition)
      yPosition += disclaimerText.length * 4 + 10

      // Diagnosis content
      const sections = [
        { title: "DIAGNOSIS", content: analysis.diagnosis },
        { title: "POSSIBLE CAUSE", content: analysis.cause },
        { title: "TREATMENT PLAN", content: analysis.treatment, isList: true },
        { title: "PREVENTION TIPS", content: analysis.prevention, isList: true },
        { title: "PRESCRIBED MEDICINES", content: analysis.medicines, isList: true },
        { title: "NATURAL REMEDIES", content: analysis.naturalRemedies, isList: true },
        { title: "RECOMMENDED PRODUCTS", content: analysis.products, isList: true },
      ]

      sections.forEach((section) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(section.title, 20, yPosition)
        yPosition += 8

        doc.setFontSize(9)
        if (section.isList && Array.isArray(section.content)) {
          section.content.forEach((item: string) => {
            const itemLines = doc.splitTextToSize(`• ${item}`, 170)
            doc.text(itemLines, 20, yPosition)
            yPosition += itemLines.length * 4 + 2
          })
        } else {
          const contentLines = doc.splitTextToSize(section.content as string, 170)
          doc.text(contentLines, 20, yPosition)
          yPosition += contentLines.length * 4
        }
        yPosition += 8
      })
    } else if (mode === "skincare" && skincareResult) {
      // Skincare plan content
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Skin Type: ${skincareForm.skinType}`, 20, yPosition)
      yPosition += 6

      if (skincareForm.goals && skincareForm.goals.length > 0) {
        const goalsText = skincareForm.goals.join(", ")
        const goalsLines = doc.splitTextToSize(`Goals: ${goalsText}`, 170)
        doc.text(goalsLines, 20, yPosition)
        yPosition += goalsLines.length * 4 + 8
      }

      const sections = [
        { title: "SKIN ANALYSIS", content: skincareResult.skinAnalysis },
        { title: "MORNING ROUTINE", content: skincareResult.morningRoutine, isList: true },
        { title: "EVENING ROUTINE", content: skincareResult.eveningRoutine, isList: true },
        { title: "PRODUCT RECOMMENDATIONS", content: skincareResult.productRecommendations, isList: true },
        { title: "DIET TIPS", content: skincareResult.dietTips, isList: true },
        { title: "LIFESTYLE TIPS", content: skincareResult.lifestyleTips, isList: true },
      ]

      sections.forEach((section) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(section.title, 20, yPosition)
        yPosition += 8

        doc.setFontSize(9)
        if (section.isList && Array.isArray(section.content)) {
          section.content.forEach((item: string, index: number) => {
            const prefix = section.title.includes("ROUTINE") ? `${index + 1}. ` : "• "
            const itemLines = doc.splitTextToSize(`${prefix}${item}`, 170)
            doc.text(itemLines, 20, yPosition)
            yPosition += itemLines.length * 4 + 2
          })
        } else {
          const contentLines = doc.splitTextToSize(section.content as string, 170)
          doc.text(contentLines, 20, yPosition)
          yPosition += contentLines.length * 4
        }
        yPosition += 8
      })
    }

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    const footerText =
      mode === "diagnosis"
        ? "This comprehensive analysis is generated by ClearCue AI. Always consult healthcare professionals for medical concerns."
        : "This personalized skincare plan is generated by ClearCue AI. Results may vary based on individual skin conditions."
    doc.text(footerText, 20, 280)

    const pdfBuffer = doc.output("arraybuffer")

    const filename = mode === "diagnosis" ? "clearcue-diagnosis-report.pdf" : "clearcue-skincare-plan.pdf"

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
