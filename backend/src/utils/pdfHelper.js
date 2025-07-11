const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Generate a PDF export with consistent styling and dynamic pagination
 * @param {Object} options - Configuration options
 * @param {Array} options.data - Array of data objects to display
 * @param {Array} options.headers - Array of column headers
 * @param {Array} options.columns - Array of column keys to extract from data objects
 * @param {Array} options.colWidths - Array of column widths
 * @param {string} options.title - Main title for the report
 * @param {string} options.subtitle - Subtitle for the report
 * @param {Array} options.info - Array of info lines to display (optional)
 * @param {Array} options.headerColor - RGB array for header color (default: blue)
 * @param {string} options.filename - Filename for the PDF
 * @param {Function} options.transformData - Function to transform data before display (optional)
 * @returns {Buffer} PDF buffer
 */
async function generatePDFExport({
  data,
  headers,
  columns,
  colWidths,
  title,
  subtitle,
  info = [],
  headerColor = [0.20, 0.55, 0.74], // Default blue
  filename,
  transformData
}) {
  const pdfDoc = await PDFDocument.create();
  const { width, height } = { width: 595.28, height: 841.89 }; // A4 size
  const margin = 50;
  const maxRowsPerPage = 25; // Adjust based on your table row height
  const totalPages = Math.ceil(data.length / maxRowsPerPage);
  
  // Fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Process data in chunks for multiple pages
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([width, height]);
    const startIndex = pageNum * maxRowsPerPage;
    const endIndex = Math.min(startIndex + maxRowsPerPage, data.length);
    const pageData = data.slice(startIndex, endIndex);
    
    let y = height - margin;

    // Header bar
    page.drawRectangle({
      x: 0, y: height - 80, width, height: 80, color: rgb(...headerColor)
    });
    page.drawText('App4KITAs', {
      x: margin, y: height - 50, size: 24, font: fontBold, color: rgb(1, 1, 1)
    });
    page.drawText(pageNum === 0 ? title : `${title} (Fortsetzung)`, {
      x: margin, y: height - 75, size: 16, font, color: rgb(1, 1, 1)
    });
    page.drawText(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, {
      x: margin, y: height - 90, size: 10, font, color: rgb(1, 1, 1)
    });
    y = height - 110;

    // Report info (only on first page)
    if (pageNum === 0 && info.length > 0) {
      info.forEach((infoLine, index) => {
        const isBold = infoLine.bold || index === 0;
        page.drawText(infoLine.text, {
          x: margin, y, size: 12, font: isBold ? fontBold : font, color: rgb(0.17, 0.24, 0.31)
        });
        y -= 20;
      });
    }

    // Table headers
    let x = margin;
    headers.forEach((header, i) => {
      page.drawRectangle({ x, y: y - 5, width: colWidths[i], height: 20, color: rgb(0.17, 0.24, 0.31) });
      page.drawText(header, {
        x: x + 5, y: y, size: 10, font: fontBold, color: rgb(1, 1, 1)
      });
      x += colWidths[i];
    });
    y -= 25;

    // Table rows for this page
    pageData.forEach((item, idx) => {
      x = margin;
      const globalIndex = startIndex + idx;
      const rowColor = globalIndex % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.98);
      // Data
      const processedItem = transformData ? transformData(item) : item;
      // Calculate row height based on the maximum number of lines in any cell
      const maxLines = Math.max(...columns.map(col => {
        const value = processedItem[col];
        const text = value?.toString() || '';
        return wrapText(text, font, 9, Math.max(...colWidths) - 10).length;
      }));
      const rowHeight = Math.max(20, maxLines * 10);
      
      // Background
      page.drawRectangle({ x, y: y - 5, width: colWidths.reduce((a, b) => a + b, 0), height: rowHeight, color: rowColor });
      const rowData = columns.map(col => {
        const value = processedItem[col];
        if (value instanceof Date) {
          return value.toLocaleDateString('de-DE');
        }
        return value?.toString() || '';
      });
      rowData.forEach((cell, i) => {
        const wrappedText = wrapText(cell, font, 9, colWidths[i] - 10);
        let yOffset = 0;
        wrappedText.forEach((line, index) => {
          page.drawText(line, {
            x: x + 5, y: y - yOffset, size: 9, font, color: rgb(0.17, 0.24, 0.31)
          });
          yOffset += 10;
        });
        x += colWidths[i];
      });
      
      y -= rowHeight;
    });

    // Footer (dynamic pagination)
    page.drawText(`Seite ${pageNum + 1} von ${totalPages}`, {
      x: width / 2 - 40, y: margin / 2, size: 8, font, color: rgb(0.58, 0.65, 0.67)
    });
  }

  return await pdfDoc.save();
}

/**
 * Helper function to create info lines for reports
 * @param {Array} infoArray - Array of {text, bold} objects
 * @returns {Array} Formatted info array
 */
function createInfoLines(...infoArray) {
  return infoArray.map((info, index) => ({
    text: typeof info === 'string' ? info : info.text,
    bold: typeof info === 'string' ? index === 0 : info.bold || index === 0
  }));
}

// Replace the table cell drawing logic to wrap long text in cells
// Use a helper function to split text into lines that fit the column width
function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [''];
  
  const words = text.toString().split(' ');
  let lines = [];
  let currentLine = '';
  
  for (let word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  // If no lines were created, return the original text truncated
  if (lines.length === 0) {
    return [text.toString().substring(0, Math.floor(maxWidth / (fontSize * 0.6)))];
  }
  
  return lines;
}

module.exports = {
  generatePDFExport,
  createInfoLines
}; 