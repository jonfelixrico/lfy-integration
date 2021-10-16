const PORT = 3000;

const express = require("express");
const app = express();

app.use(express.json());

const {
  sendShopifyFulfillmentToPayo,
} = require("../infrastructure/send-shopify-fulfillment-to-payo");

app.get("/", async (req, res) => {
  sendShopifyFulfillmentToPayo(req.body);
  res.send("rrat");
});

app.listen(PORT, () => {
  console.log("👍 ogeyy 👍");
});
