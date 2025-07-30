require('dotenv').config()
const Payarc = require("../index");
//const Payarc = require("../testcode");

const bearerToken = process.env.PAYARC_KEY;
const baseUrl = process.env.PAYARC_ENV;
const bearerTokenAgent = process.env.PAYARC_AGENTKEY;
const accountListExistingBearerToken = process.env.PAYARC_ACCOUNTLISTEXISTINGKEY;
const payarcDisputeCaseToken = process.env.PAYARC_DISPUTECASEKEY;
const payarcAgentWithSubAgentCaseToken = process.env.PAYARC_AGENTWITHSUBAGENTKEY;
const payarcConnectAccessToken = process.env.PAYARC_PAYARCCONNECTKEY;
const apiVersion = "/v1/";
const version = "1.0";

const payarc = new Payarc(
  bearerToken,
  baseUrl,
  apiVersion,
  version,
  bearerTokenAgent
);

const payarcListExisting = new Payarc(
  payarcConnectAccessToken,
  baseUrl,
  apiVersion,
  version,
  accountListExistingBearerToken
);

async function test() {
  payarc.charges.listByAgentTraditional({
    from_date: '2025-07-23',
    to_date: '2025-07-23'
  })
.then((response) => {
    const { charges = [] } = response;
    console.log(charges);
})
.catch(error => console.error(error));
  //JSON.stringify(result, null, '\t')
}

// async function test() {
//   payarc.customers.list({
//     limit: 3
// })
// .then((response) => {
//     const { customers = [] } = response;
//     console.log(customers);
// })
// .catch(error => console.error(error));
//   //JSON.stringify(result, null, '\t')
// }

test();