import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GeneratePDFProps {
  title: string;
  columns: string[];
  data: any[][];
  filename: string;
}

export const generatePDF = ({ title, columns, data, filename }: GeneratePDFProps) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);

  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated on: ${date}`, 14, 28);

  // Add Branding or Subtitle
  doc.setFontSize(12);
  doc.setTextColor(0, 128, 128); // Teal color
  doc.text('NovaEdu LMS Report', 160, 22);

  // Create Table
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: 'middle',
      overflow: 'linebreak',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [13, 148, 136], // Teal-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 253, 250], // Teal-50
    },
    columnStyles: {
      // 0: { cellWidth: 20 }, // Adjust if needed
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};
