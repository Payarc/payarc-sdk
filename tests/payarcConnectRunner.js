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


  // payarc.charges.list()
  //   .then((response) => {
  //     const { charges = {} } = response;
  //     console.log(JSON.stringify(charges, null, '\t'));
  //   })
  //   .catch(error => console.error(error));

// payarc.charges.retrieve('6dl8k07950g9ymxw')
//   .then(charge => console.log('Success the charge is ', JSON.stringify(charge, null, '\t')))
//   .catch(error => console.error('Error detected:', error));


  // payarc.charges.create({
  //   amount: 10, // Amount in cents
  //   currency: 'usd', // Currency code (e.g., 'usd')
  //   source: {
  //     card_number: '4085404032505228', // Payment source (e.g., credit card number)
  //     exp_month: '02',  //Credit card attributes 
  //     exp_year: '2027', //Credit card attributes 
  //   },
  //   splits: [
  //     {
  //       mid: "0709900000098856",
  //       percent: 30,
  //     },
  //     {
  //       mid: "0709900000098856",
  //       amount: 15,
  //     }
  //   ]
  // })
  //   .then(charge => console.log('Success the charge is ', JSON.stringify(charge, null, '\t')))
  //   .catch(error => console.error('Error detected:', error));



    // payarc.instructionalFunding.list()
    // .then((response) => {
    //   console.log(JSON.stringify(response, null, '\t'));
    // })
    // .catch(error => console.error(error));


    payarc.instructionalFunding.create(
      {
        mid: "0709900000098856",
        amount: 500,
      }
    )
    .then((response) => {
      console.log(JSON.stringify(response, null, '\t'));
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