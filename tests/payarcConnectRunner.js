require('dotenv').config()
const Payarc = require("../index");

const bearerToken = process.env.PAYARC_KEY;
const baseUrl = process.env.PAYARC_ENV;
const apiVersion = "/v1/";
const version = "1.0";
const bearerTokenAgent = null;

const payarc = new Payarc(
  bearerToken,
  baseUrl,
  apiVersion,
  version,
  bearerTokenAgent
);

async function login() {
    await payarc.payarcConnect
    .login()
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function sale() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .sale(tenderType = "CREDIT", ecrRefNum = "REF99", amount = "99", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function pcVoid() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .void(payarcTransactionId = "WBMROoRyXoMRXOyn", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function refund() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .refund(amount = "100", payarcTransactionId = "WBMROoRyXoMRXOyn", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function blindCredit() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .blindCredit(ecrRefNum = "Ref11", amount = "15", token = "IYmDAxNtma7g5228", expDate = "0227", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function auth() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .auth(ecrRefNum = "Ref11", amount = "111", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function postAuth() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .postAuth(ecrRefNum = "Ref12", origRefNum = "25", amount = "10", deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function lastTransaction() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .lastTransaction(deviceSerialNo = "1850406725")
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function serverInfo() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .serverInfo()
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}
async function terminals() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error:", error));
    payarc.payarcConnect
    .terminals()
    .then((result) => {
      console.log("Result", result);
    })
    .catch((error) => console.error("Error:", error));
}

// login()
// sale()
// pcVoid()  
// refund()
// blindCredit()
// auth()
// postAuth()
// lastTransaction()
// serverInfo()
terminals()

