import { createPdf } from "../helpers/createPdf";
import { createPdfCondensed } from "../helpers/createPdfCondensed";

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

export async function healthCheckController(req: any, res: any) {
  res.send("OK");
}

export async function createPdfController(req: any, res: any) {

  // If parameter 'isCondensed' is true, use the condensed version of the PDF
  const isCondensed = req.query.isCondensed === "true";

  // Parse the request body
  const pdfDetails = req.body as QuoteRequest;

  // Create the PDF
  // const pdfBytes = isCondensed ? await createPdfCondensed(pdfDetails) : await createPdf(pdfDetails);
  const pdfBytes = await createPdf(pdfDetails);

  // Send the PDF as a response
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(pdfBytes));
}


