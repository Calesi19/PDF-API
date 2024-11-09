export default async function healthCheckController(req: any, res: any) {
  console.log("healthCheckController");
  res.send("I'm alive.");
}
