import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ THIS LINE IS CRITICAL

export const generateReportPDF = ({
  title,
  memberInfo = [],
  tableHead = [],
  tableBody = [],
  fileName = "report.pdf",
  autoPrint = false
}) => {
  const doc = new jsPDF();

  /* ---------- Title ---------- */
  doc.setFontSize(14);
  doc.text(title, 14, 15);

  /* ---------- Member Info ---------- */
  let startY = 25;
  doc.setFontSize(10);

  memberInfo.forEach((item) => {
    doc.text(item, 14, startY);
    startY += 6;
  });

  /* ---------- TABLE (FIXED) ---------- */
  autoTable(doc, {
    startY: startY + 4,
    head: [tableHead],
    body: tableBody,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [54, 162, 235] }
  });

  /* ---------- Actions ---------- */
  if (autoPrint) {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(fileName);
  }
};
