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
  const body = req.body as QuoteRequest; // Type assertion for cleaner code

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Draw Distributor and Retailer Info
  page.drawText(`Distributor: ${body.distributorName}`, {
    x: 50,
    y: height - 50,
    size: 12,
    font,
  });
  page.drawText(`Retailer: ${body.retailerName}`, {
    x: 50,
    y: height - 70,
    size: 12,
    font,
  });

  // Add Distributor Logo
  if (body.distributorLogoUrl) {
    const logoBytes = await fetch(body.distributorLogoUrl).then((res) =>
      res.arrayBuffer(),
    );
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, {
      x: 400,
      y: height - 80,
      width: 100,
      height: 50,
    });
  }

  // Add Retailer Logo
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

  // Draw Customer Info
  page.drawText(`Customer: ${body.customerName}`, {
    x: 50,
    y: height - 110,
    size: 12,
    font,
  });
  page.drawText(`Address: ${body.customerAddress}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font,
  });
  page.drawText(`Phone: ${body.customerPhone}`, {
    x: 50,
    y: height - 150,
    size: 12,
    font,
  });
  page.drawText(`Email: ${body.customerEmail}`, {
    x: 50,
    y: height - 170,
    size: 12,
    font,
  });

  // Draw Order Info
  page.drawText(`Order Number: ${body.orderNumber}`, {
    x: 50,
    y: height - 200,
    size: 12,
    font,
  });
  page.drawText(`Order Date: ${body.orderDate}`, {
    x: 50,
    y: height - 220,
    size: 12,
    font,
  });

  // Draw Table Headers
  let yPos = height - 260;
  page.drawText("Product", { x: 50, y: yPos, size: 10, font });
  page.drawText("Quantity", { x: 200, y: yPos, size: 10, font });
  page.drawText("Price", { x: 300, y: yPos, size: 10, font });
  yPos -= 20;

  // Draw Order Items
  body.orderItems.forEach((item) => {
    page.drawText(item.name, { x: 50, y: yPos, size: 10, font });
    page.drawText(String(item.quantity), { x: 200, y: yPos, size: 10, font });
    page.drawText(`$${item.price}`, { x: 300, y: yPos, size: 10, font });
    yPos -= 20;
  });

  // Draw Summary Section
  yPos -= 20;
  page.drawText(`Subtotal: $${body.subTotal}`, {
    x: 50,
    y: yPos,
    size: 12,
    font,
  });
  yPos -= 20;
  page.drawText(`Tax: $${body.tax}`, { x: 50, y: yPos, size: 12, font });
  yPos -= 20;
  page.drawText(`Shipping: $${body.shipping}`, {
    x: 50,
    y: yPos,
    size: 12,
    font,
  });
  yPos -= 20;
  page.drawText(`Total: $${body.total}`, {
    x: 50,
    y: yPos,
    size: 12,
    font,
    color: rgb(0, 0.5, 0),
  });

  // Finalize the PDF and send it as a byte array
  const pdfBytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(pdfBytes));
}
