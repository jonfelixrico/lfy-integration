import express from "express";
import { sendShopifyFulfillmentToPayo } from "./infrastructure/send-shopify-fulfillment-to-payo";

const PORT = 3000;
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  sendShopifyFulfillmentToPayo(req.body);
  res.send("rrat");
});

app.listen(PORT, () => {
  console.log("👍 ogeyy 👍");
});
