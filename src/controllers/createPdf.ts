import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface QuoteRequest {
  distributorName: string;
  distributorLogoUrl: string;
  retailerName: string;
  retailerLogoUrl: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  orderItems: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
  subTotal: string;
  tax: string;
  shipping: string;
  total: string;
}

export async function createPdfController(req: any, res: any) {
  const body = req.body as QuoteRequest;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

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

  page.drawText(`Address:`, {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText(`${body.retailerName}`, {
    x: 130,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText(`Phone:`, {
    x: 50,
    y: height - 185,
    size: 12,
    font,
  });

  page.drawText(`${body.retailerName}`, {
    x: 130,
    y: height - 185,
    size: 12,
    font,
  });

  page.drawText(`Fax:`, {
    x: 50,
    y: height - 200,
    size: 12,
    font,
  });
  page.drawText(`${body.customerPhone}`, {
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
    font,
  });

  page.drawText(`$${body.total}`, {
    x: 490,
    y: height - 793,
    size: 12,
    font,
  });

  page.drawText(`Order`, {
    x: 500,
    y: height - 50,
    size: 12,
    font,
  });
  page.drawText(`#${body.orderNumber}`, {
    x: 400,
    y: height - 50,
    size: 12,
    font,
  });

  page.drawText(`${body.orderDate}`, {
    x: 400,
    y: height - 65,
    size: 12,
    font,
  });

  page.drawText(`Page 1 of 1`, {
    x: 500,
    y: height - 65,
    size: 12,
    font,
  });

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
    const retailerLogoBytes = await fetch(body.retailerLogoUrl).then((res) =>
      res.arrayBuffer(),
    );
    const retailerLogoImage = await pdfDoc.embedPng(retailerLogoBytes);
    page.drawImage(retailerLogoImage, {
      x: 400,
      y: height - 140,
      width: 100,
      height: 50,
    });
  }

  let yPos = height - 260;
  page.drawText("Product", { x: 50, y: yPos, size: 10, font });
  page.drawText("Quantity", { x: 200, y: yPos, size: 10, font });
  page.drawText("Price", { x: 300, y: yPos, size: 10, font });
  yPos -= 20;

  const maxWidth = 140; // Maximum width for the item name column
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
      x: 200,
      y: yPos,
      size: fontSize,
      font,
    });
    page.drawText(`$${item.price}`, { x: 300, y: yPos, size: fontSize, font });

    yPos -= 20 * itemNameLines.length;
  });

  const pdfBytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(pdfBytes));
}