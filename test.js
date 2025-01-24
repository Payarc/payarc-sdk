const Payarc = require("./index");

const bearerToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0Mzg4IiwianRpIjoiOTI0ODMyZjJiM2Q1MDZiZjU1M2Q0NWQzMWJkNTg0MWQ0ZWRjMjdmMjI4ODg4NWU4NWQzMDdmNjk3MWJmYjMxMTJhZjYyYzhmN2MyZTlhZTciLCJpYXQiOjE2MTExNzUxNjgsIm5iZiI6MTYxMTE3NTE2OCwiZXhwIjoxNzY4ODU1MTY4LCJzdWIiOiIxNTY1MyIsInNjb3BlcyI6IioifQ.bYo6ZQ4Jg3wjT_KibvLGpmTpWgapBfyJOXxH-1boMbVyzmj9oO_o8NpLu4aR8vGt4ZcCwmqWkuAJkYdDij0DeDuqI_7IJcBK7hRHBR4tjRbo2plmc44xnxFp5G-NbXC3lj620L2lfgBheyMRAhpkaLfwaVBQvOsq829kNmSlPhom_OhTmyBEDZi5oTFg44vKi4LfI9gORlV0wBFELrcjWoodTsMJHDk_Tiuxwkdf81XvaM6uIiJUTgnnPZM4LDINHbi9YQZ7HYORSIFn2gOyfdGSwTiY5gi13vC-ISDZxBxQWN61JMEwIheaFTubmNgUTvn7gSsp8rnSLo1Hm7p_Mh5lg6Jf2Z89509KRgO5X3iQMWMWmvAX3leSYUi0ngAXQBGdEHlyUNNy0S3dh-fJzkyFpQxkftUDX3ZKbJxCd4H4Vfe5WpgmEdjhD2wb6RI1GnPBkG6SwGy6kcHGjNKxK4hFBKZPCSwWJD7VgJP-eXQMU2J-i9tcc-zp4Acb4qjWe02FYBMKxY6FmDpFpLSvRZGXdH5Xegw6kfDIZWJF-mOB5g0ISFC_tjfxza544iEIOXlYkKzkCNXO0XbJUH6XFFv0Obd74VBrfPaHR-zxbgDmqHFRH_6bWIGAbwiwK3S8GG5RwDpk5uvEaC2F6V0M_o7ePEint8u6BCCK8WYPm7g";
const baseUrl = "prod";
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

async function sale() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .sale("CREDIT", "SALE", "REF99", "99", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}


async function pcVoid() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .void("REF16", "WBMROoRyXoMRXOyn", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

async function refund() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .refund("15", "DMWbOLoXnBWWoOBX", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

async function blindCredit() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .blindCredit("Ref11", "15", "IYmDAxNtma7g5228", "0227", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}
async function auth() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .auth("Ref11", "111", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

async function postAuth() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .postAuth("Ref12", "25", "10", "1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}
async function lastTransaction() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .lastTransaction("1850406725")
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

async function serverInfo() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .serverInfo()
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

async function terminals() {
    await payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));

    payarc.payarcConnect
    .terminals()
    .then((result) => {
      console.log("Success", result);
    })
    .catch((error) => console.error("Error detected:", error));
      
}

// sale()
// pcVoid()  
// refund()
// blindCredit()
// auth()
// postAuth()
// lastTransaction()
// serverInfo()
// terminals()