const axios = require("axios");
const qs = require("qs");

const {
  formatShopifyFulfillmentObjectToPayoOrderObject,
} = require("../domain/format-fulfillment-object");

const { PAYO_CLIENT_ID, PAYO_PGW_ID, PAYO_PGW_KEY } = process.env;
const payoApiConstants = {
  clientId: PAYO_CLIENT_ID,
  pgwId: PAYO_PGW_ID,
  pgwKey: PAYO_PGW_KEY,
};

const PAYO_CREATE_ORDER_URL = "https://api.payo.asia/order/create";

/**
 * The fulfillment data that we received from Shopify is formatted to send a order created request to Payo.
 * @param {Object} webhookPayload Payload from one of Shopify's fulfillment-related webhook topics.
 */
async function sendShopifyFulfillmentObjectToPayo(webhookPayload) {
  const toSendToPayo = formatShopifyFulfillmentObjectToPayoOrderObject(
    webhookPayload,
    payoApiConstants
  );

  try {
    await axios.post(
      PAYO_CREATE_ORDER_URL,
      qs.stringify(toSendToPayo), // since we're using the urlencoded type, we have to encode the payload before sending it
      {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      }
    );
    console.log(`Successfully sent order ${webhookPayload.order_id} to Payo.`);
  } catch (e) {
    console.error(
      `Something went wrong while trying to send order ${webhookPayload.order_id}.`,
      e
    );
  }
}

module.exports = {
  sendShopifyFulfillmentObjectToPayo,
};
