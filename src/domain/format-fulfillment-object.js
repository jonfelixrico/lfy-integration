import sha256 from "crypto-js/sha256";

/**
 * Generates the signature required by payo when creating order requests.
 *
 * @param {Object} createOrderPayload An object that contains the required data for sending a Create Order REQUEST to Payo
 * @param {String} payoApiConstants
 * @returns
 */
function generatePayoSignature(
  { contact, items },
  { clientId, pgwId, pgwKey }
) {
  const { email, firstname, lastname } = contact ?? {};

  const toBeSigned = [
    /*
     * The ordering of the items here are as prescribed by Payo.
     * Please see page 9/23 of th Payo 2.0.4 documentation (general remarks of request fields for warehouse clients).
     */
    email,
    firstname,
    lastname,
    items.length,
    clientId,
    pgwId,
    pgwKey,
  ].join("");

  return sha256(toBeSigned);
}

/**
 * Converts an object that follows the structure of Shopify's Fulfillment object into what Payo requires when doing a Order create request.
 *
 * @param {Object} shopifyFullfilmentObject An object that follows the schema defined by Shopify for their Fulfillment object
 * @param {Object} payoApiConstants Contains properties that allows us to talk to Payo
 * @returns
 */
export function formatShopifyFulfillmentObjectToPayoOrderObject(
  { destination, line_items, order_id },
  payoApiConstants
) {
  line_items = line_items ?? [];

  const {
    first_name,
    last_name,
    phone,
    country,
    province,
    address_1,
    address_2,
    zip,
  } = destination ?? {};

  const { clientId, pgwId } = payoApiConstants;

  const orderObject = {
    contact: {
      firstname: first_name,
      lastname: last_name,
      phone,
    },
    shipping: {
      country,
      state: province,
      // concatenates address_1 and address_2 together if both are present
      street: [address_1, address_2]
        .filter(Boolean) // remove falsy values (empty string, null, or undefined). will filter out address 2 if empty
        .join(" "), // joins strings together. if address_2 got filtered out because it was empty, this will just return a string equal to address_1
      zip,
    },
    order_id,

    client_id: clientId,
    pgw_id: pgwId,
  };

  orderObject.items = line_items
    .filter(Boolean)
    .map(({ product_id, price, quantity }) => {
      return {
        id: product_id,
        price, // we'll assume that this is in PHP
        quantity,
      };
    });

  /*
   * The population of object properties above must be done before `generatePayoSignature`. What we populated above
   * are the ones used in `generatedPayoSignature`.
   *
   * The key "Signature" as prescribed by the payo API. This is NOT a capitalization error.
   */
  orderObject.Signature = generatePayoSignature(orderObject, payoApiConstants);

  return orderObject;
}
