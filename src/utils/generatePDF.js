import jsPDF from "jspdf";
import { formatEther, formatDate, formatAddress } from "./helpers.js";

export const generateWillPDF = (will, beneficiaries, account, fileName = "Digital_Will.pdf") => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  const lineHeight = 7;
  const margin = 15;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("DIGITAL WILL", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Decorative line
  doc.setDrawColor(79, 70, 229); // Indigo
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Document Generation Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 8;

  // Testator Information Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("TESTATOR INFORMATION", margin, yPosition);
  yPosition += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  addLabelValue(doc, "Testator Address:", formatAddress(will?.testator || account), margin, yPosition);
  yPosition += lineHeight + 2;
  addLabelValue(doc, "Executor Address:", formatAddress(will?.executor), margin, yPosition);
  yPosition += lineHeight + 2;
  addLabelValue(doc, "Total ETH Locked:", `${formatEther(will?.totalEthLocked)} ETH`, margin, yPosition);
  yPosition += lineHeight + 2;
  addLabelValue(doc, "Inactivity Period:", `${Math.floor(will?.inactivityPeriod / 86400)} days`, margin, yPosition);
  yPosition += lineHeight + 2;
  addLabelValue(doc, "Last Check-In:", formatDate(will?.lastCheckIn), margin, yPosition);
  yPosition += lineHeight + 2;
  addLabelValue(doc, "Status:", will?.isExecuted ? "Executed" : will?.isActive ? "Active" : "Inactive", margin, yPosition);
  yPosition += 15;

  // Beneficiaries Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BENEFICIARIES", margin, yPosition);
  yPosition += 10;

  if (beneficiaries && beneficiaries.length > 0) {
    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(79, 70, 229); // Indigo
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, "F");
    
    const colWidth = (pageWidth - 2 * margin) / 4;
    doc.text("#", margin + 3, yPosition);
    doc.text("Name", margin + colWidth + 3, yPosition);
    doc.text("Percentage", margin + colWidth * 2 + 3, yPosition);
    doc.text("Amount (ETH)", margin + colWidth * 3 + 3, yPosition);
    yPosition += 10;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    beneficiaries.forEach((beneficiary, index) => {
      const amount = (parseFloat(formatEther(will?.totalEthLocked)) * beneficiary.percentage) / 100;

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, "F");
      }

      doc.text(`${index + 1}`, margin + 3, yPosition);
      doc.text(beneficiary.name || "Unknown", margin + colWidth + 3, yPosition);
      doc.text(`${beneficiary.percentage}%`, margin + colWidth * 2 + 3, yPosition);
      doc.text(`${amount.toFixed(4)}`, margin + colWidth * 3 + 3, yPosition);

      yPosition += 8;

      // Wallet address on next line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`${formatAddress(beneficiary.walletAddress)}`, margin + colWidth + 3, yPosition);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPosition += 7;

      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }

  yPosition += 5;

  // How It Works Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("HOW IT WORKS", margin, yPosition);
  yPosition += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const steps = [
    {
      title: "1. Active Period",
      description: "Keep your account active by checking in regularly through the 'Proof of Life' feature."
    },
    {
      title: "2. Inactivity Trigger",
      description: `If you don't check in for ${Math.floor(will?.inactivityPeriod / 86400)} days, the will becomes eligible for execution.`
    },
    {
      title: "3. Execution",
      description: "Your executor (or any authorized party) can execute the will to distribute funds."
    },
    {
      title: "4. Distribution",
      description: "Funds are automatically transferred to beneficiaries according to their percentages."
    }
  ];

  steps.forEach((step) => {
    doc.setFont("helvetica", "bold");
    doc.text(step.title, margin, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    const wrappedText = doc.splitTextToSize(step.description, pageWidth - 2 * margin - 5);
    doc.text(wrappedText, margin + 5, yPosition);
    yPosition += wrappedText.length * lineHeight + 3;

    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  });

  yPosition += 5;

  // Document Hash Section
  if (will?.ipfsDocHash) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DOCUMENT HASH (IPFS)", margin, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const wrappedHash = doc.splitTextToSize(will.ipfsDocHash, pageWidth - 2 * margin - 5);
    doc.text(wrappedHash, margin + 2, yPosition);
    yPosition += wrappedHash.length * 5;
  }

  // Footer
  yPosition = pageHeight - 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a digital will document generated on the blockchain.", margin, yPosition);
  doc.text("Keep this document safe for your records.", margin, yPosition + 5);

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(fileName);
};

/**
 * Helper function to add label-value pairs
 */
const addLabelValue = (doc, label, value, x, y) => {
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // Indigo for labels
  doc.text(label, x, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Black for values
  doc.text(value, x + 60, y);
};
