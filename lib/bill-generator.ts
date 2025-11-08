import jsPDF from "jspdf"
import { formatINR } from "./currency"

interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface BillData {
  billId: string
  timestamp: string
  items: BillItem[]
  total: number
  phone: string
  paymentMethod: string
  transactionId: string
  storeName: string
}

export function generatePDFBill(data: BillData) {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Define colors as hex values (no oklch)
    const colors = {
      primary: "#1a1a1a",
      accent: "#0ea5e9",
      muted: "#6b7280",
      border: "#e5e7eb",
      background: "#ffffff",
    }

    // Set background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Header with store name
    doc.setFontSize(24)
    doc.setTextColor(
      Number.parseInt(colors.primary.slice(1, 3), 16),
      Number.parseInt(colors.primary.slice(3, 5), 16),
      Number.parseInt(colors.primary.slice(5, 7), 16),
    )
    doc.setFont(undefined, "bold")
    doc.text(data.storeName, margin, yPosition)
    yPosition += 12

    // Store info divider
    doc.setDrawColor(
      Number.parseInt(colors.border.slice(1, 3), 16),
      Number.parseInt(colors.border.slice(3, 5), 16),
      Number.parseInt(colors.border.slice(5, 7), 16),
    )
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Bill details
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.setFont(undefined, "normal")
    doc.text(`Bill ID: ${data.billId}`, margin, yPosition)
    yPosition += 6
    doc.text(`Date: ${data.timestamp}`, margin, yPosition)
    yPosition += 6
    doc.text(`Phone: +91 ${data.phone}`, margin, yPosition)
    yPosition += 8

    // Items section
    doc.setFont(undefined, "bold")
    doc.setTextColor(
      Number.parseInt(colors.primary.slice(1, 3), 16),
      Number.parseInt(colors.primary.slice(3, 5), 16),
      Number.parseInt(colors.primary.slice(5, 7), 16),
    )
    doc.text("Items", margin, yPosition)
    yPosition += 7

    // Items table header
    doc.setFontSize(9)
    doc.setFont(undefined, "bold")
    doc.setTextColor(107, 114, 128)
    doc.text("Item", margin, yPosition)
    doc.text("Qty", margin + contentWidth * 0.65, yPosition, { align: "right" })
    doc.text("Price", margin + contentWidth * 0.85, yPosition, { align: "right" })
    yPosition += 6

    doc.setDrawColor(
      Number.parseInt(colors.border.slice(1, 3), 16),
      Number.parseInt(colors.border.slice(3, 5), 16),
      Number.parseInt(colors.border.slice(5, 7), 16),
    )
    doc.line(margin, yPosition - 1, pageWidth - margin, yPosition - 1)

    // Items list
    doc.setFont(undefined, "normal")
    doc.setTextColor(
      Number.parseInt(colors.primary.slice(1, 3), 16),
      Number.parseInt(colors.primary.slice(3, 5), 16),
      Number.parseInt(colors.primary.slice(5, 7), 16),
    )
    doc.setFontSize(9)

    data.items.forEach((item) => {
      doc.text(item.name, margin, yPosition)
      doc.text(item.quantity.toString(), margin + contentWidth * 0.65, yPosition, { align: "right" })
      doc.text(formatINR(item.price * item.quantity), margin + contentWidth * 0.85, yPosition, { align: "right" })
      yPosition += 6
    })

    yPosition += 4

    // Total section
    doc.setDrawColor(
      Number.parseInt(colors.border.slice(1, 3), 16),
      Number.parseInt(colors.border.slice(3, 5), 16),
      Number.parseInt(colors.border.slice(5, 7), 16),
    )
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 7

    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.setTextColor(
      Number.parseInt(colors.primary.slice(1, 3), 16),
      Number.parseInt(colors.primary.slice(3, 5), 16),
      Number.parseInt(colors.primary.slice(5, 7), 16),
    )
    doc.text("Total Amount", margin, yPosition)
    doc.text(formatINR(data.total), pageWidth - margin, yPosition, { align: "right" })
    yPosition += 8

    // Payment info
    doc.setFontSize(9)
    doc.setFont(undefined, "normal")
    doc.setTextColor(107, 114, 128)
    doc.text(`Payment Method: ${data.paymentMethod}`, margin, yPosition)
    yPosition += 6
    doc.text(`Transaction ID: ${data.transactionId}`, margin, yPosition)
    yPosition += 12

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text("Thank you for your purchase!", pageWidth / 2, yPosition, { align: "center" })

    // Download
    const filename = `bill-${data.billId}.pdf`
    doc.save(filename)
  } catch (error) {
    console.error("[v0] Bill generation error:", error)
    alert("Error generating bill. Please try again.")
  }
}
