import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface QuoteRequest {
  distributorName: string;
  distributorLogoUrl: string;
  retailerName: string;
  retailerLogoUrl: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerFax: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  total: string;
  orderItems: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

export async function createPdf(body: QuoteRequest): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const lines = [];
    let currentLine = "";

    for (const word of text.split(" ")) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (lineWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Vendor Information Box
  page.drawRectangle({
    x: 40,
    y: height - 250,
    width: 250,
    height: 150,
    borderColor: rgb(0, 0, 0), // Black
    borderWidth: 1,
  });

  page.drawRectangle({
    x: 45,
    y: height - 105,
    width: 115,
    height: 10,
    color: rgb(1, 1, 1), // Black
  });

  page.drawText(`Vendor Information:`, {
    x: 50,
    y: height - 105,
    size: 12,
    font,
  });

  // Write Name
  page.drawText(`Name:`, {
    x: 50,
    y: height - 125,
    size: 12,
    font,
  });

  page.drawText(`${body.distributorName}`, {
    x: 130,
    y: height - 125,
    size: 12,
    font,
  });

  // Write Address
  page.drawText(`Address:`, {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText(`${body.customerAddress}`, {
    x: 130,
    y: height - 140,
    size: 12,
    font,
  });

  // Write Phone
  page.drawText(`Phone:`, {
    x: 50,
    y: height - 185,
    size: 12,
    font,
  });

  page.drawText(`${body.customerPhone}`, {
    x: 130,
    y: height - 185,
    size: 12,
    font,
  });

  // Write Fax
  page.drawText(`Fax:`, {
    x: 50,
    y: height - 200,
    size: 12,
    font,
  });

  page.drawText(`${body.customerFax}`, {
    x: 130,
    y: height - 200,
    size: 12,
    font,
  });

  page.drawText(`Email:`, {
    x: 50,
    y: height - 215,
    size: 12,
    font,
  });

  page.drawText(`${body.customerEmail}`, {
    x: 130,
    y: height - 215,
    size: 12,
    font,
  });

  // Footer
  page.drawRectangle({
    x: 40,
    y: height - 800,
    width: 520,
    height: 25,
    borderColor: rgb(0, 0, 0), // Black
    borderWidth: 1,
  });

  page.drawText(`Order Total:`, {
    x: 420,
    y: height - 793,
    size: 12,
    font:
      boldFont,
  });

  page.drawText(`$${body.total}`, {
    x: 490,
    y: height - 793,
    size: 12,
    font:
      boldFont,
  });

  // Header

  // Specify Document Title
  page.drawText(`Order`, {
    x: 500,
    y: height - 50,
    size: 12,
    font,
  });

  // Write Order Number
  page.drawText(`#${body.orderNumber}`, {
    x: 400,
    y: height - 50,
    size: 12,
    font,
  });

  // Write Order Date
  page.drawText(`${body.orderDate}`, {
    x: 400,
    y: height - 65,
    size: 12,
    font,
  });

  // Write Page Number
  page.drawText(`Page 1 of 1`, {
    x: 500,
    y: height - 65,
    size: 12,
    font,
  });

  // Draw the distributor logo
  if (body.distributorLogoUrl) {
    const logoBytes = await fetch(body.distributorLogoUrl).then((res) =>
      res.arrayBuffer(),
    );
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // Original dimensions of the image
    const originalWidth = logoImage.width;
    const originalHeight = logoImage.height;

    // Target dimensions
    const targetWidth = 100;
    const targetHeight = 50;

    // Calculate the scaling factor to maintain aspect ratio
    const widthScale = targetWidth / originalWidth;
    const heightScale = targetHeight / originalHeight;
    const scale = Math.min(widthScale, heightScale);

    // Apply scaling to maintain aspect ratio
    const displayWidth = originalWidth * scale;
    const displayHeight = originalHeight * scale;

    // Draw the image with scaled dimensions
    page.drawImage(logoImage, {
      x: 50,
      y: height - 80,
      width: displayWidth,
      height: displayHeight,
    });
  }

  if (body.retailerLogoUrl) {
    const logoBytes = await fetch(body.retailerLogoUrl).then((res) =>
      res.arrayBuffer(),
    );
    const retailerLogoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(retailerLogoImage, {
      x: 400,
      y: height - 270,
      width: 100,
      height: 180,
    });
  }

  page.drawRectangle({
    x: 40,
    y: height - 306,
    width: 520,
    height: 20,
    color: rgb(0.9, 0.9, 0.9),
  });

  let yPos = height - 300;
  page.drawText("Item Description", { x: 50, y: yPos, size: 10, font });
  page.drawText("Quantity", { x: 400, y: yPos, size: 10, font });
  page.drawText("Price", { x: 500, y: yPos, size: 10, font });
  yPos -= 20;

  const maxWidth = 240; // Maximum width for the item name column
  const fontSize = 10;

  body.orderItems.forEach((item, index) => {
    const itemNameLines = wrapText(item.name, maxWidth, fontSize);

    itemNameLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: 50,
        y: yPos - lineIndex * 12,
        size: fontSize,
        font,
      });
    });

    page.drawText(String(item.quantity), {
      x: 400,
      y: yPos,
      size: fontSize,
      font,
    });
    page.drawText(`$${item.price}`, { x: 500, y: yPos, size: fontSize, font });

    page.drawRectangle({
      x: 40,
      y: yPos + fontSize + 3,
      width: 520,
      height: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    yPos -= fontSize + 12 * itemNameLines.length;
  });

  page.drawRectangle({
    x: 40,
    y: yPos - 5,
    width: 520,
    height: 20,
    color:
      rgb(246 / 255, 243 / 255, 226 / 255),
  });


  page.drawText("Total:", { x: 400, y: yPos, size: 10, font: boldFont });
  page.drawText("$3443.43", { x: 500, y: yPos, size: 10, font: boldFont });

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}
