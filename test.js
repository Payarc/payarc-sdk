/* Delete me!! */

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

/* payarc.charges.create({
        amount: 1, // Amount in cents
        currency: 'usd', // Currency code (e.g., 'usd')
    source:{
        card_number: '4085404032505228', // Payment source (e.g., credit card number)
        exp_month: '02',  //Credit card attributes 
        exp_year: '2027', //Credit card attributes 
        }
    })
        .then(charge => console.log('Success the charge is ',charge))
        .catch(error => console.error('Error detected:',error)); */

/* payarc.billing.plan.subscription
  .list()
  .then((subscription) =>
    console.log("Success the subscription is ", subscription)
  );

payarc.charges
payarc.customers
payarc.applications
payarc.splitCampaigns
payarc.billing
payarc.disputes */

payarc.payarcConnect
  .login(
    "",
    "",
    ""
  )
  .then((charge) => {
    console.log("Success", charge);
    console.log(payarc.payarcConnectAccessToken);
  })
  .catch((error) => console.error("Error detected:", error));
