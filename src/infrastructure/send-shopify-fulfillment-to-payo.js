const axios = require("axios");
const qs = require("qs");

const PAYO_API_HOST = "https://api.payo.asia";

/**
 * Preconfigured Axios instance just for talking to Payo. Use this instead of using `axios` directly.
 */
const payoAxios = axios.create({
  baseURL: PAYO_API_HOST,
  headers: { "content-type": "application/x-www-form-urlencoded" },
  transformRequest: (data) => qs.stringify(data),
});

const {
  formatShopifyFulfillmentObjectToPayoOrderObject,
} = require("../domain/format-fulfillment-object");

const { PAYO_CLIENT_ID, PAYO_PGW_ID, PAYO_PGW_KEY } = process.env;
const payoApiConstants = {
  clientId: PAYO_CLIENT_ID,
  pgwId: PAYO_PGW_ID,
  pgwKey: PAYO_PGW_KEY,
};

const PAYO_CREATE_ORDER_ENDPOINT = "order/create";

/**
 * The fulfillment data that we received from Shopify is formatted to send a order created request to Payo.
 * @param {Object} fulfillmentObject Payload from one of Shopify's fulfillment-related webhook topics.
 */
async function sendShopifyFulfillmentToPayo(fulfillmentObject) {
  const toSendToPayo = formatShopifyFulfillmentObjectToPayoOrderObject(
    fulfillmentObject,
    payoApiConstants
  );

  try {
    await payoAxios.post(PAYO_CREATE_ORDER_ENDPOINT, toSendToPayo);
    console.log(
      `Successfully sent order ${fulfillmentObject.order_id} to Payo.`
    );
  } catch (e) {
    console.error(
      `Something went wrong while trying to send order ${fulfillmentObject.order_id}.`,
      e
    );
  }
}

module.exports = {
  sendShopifyFulfillmentToPayo,
};
