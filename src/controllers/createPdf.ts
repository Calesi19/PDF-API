export async function createPdfController(req: any, res: any) {
  console.log("createPdfController");

  var response = { message: "createPdfController" };

  res.status(200).json(response);
}
