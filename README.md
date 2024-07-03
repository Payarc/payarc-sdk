# Payarc SDK

The Payarc SDK allows developers to integrate Payarc's payment processing capabilities into their applications with ease. This SDK provides a comprehensive set of APIs to handle transactions, customer management, and candidate merchant management.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

You can install the Payarc SDK using npm (for Node.js projects).

```bash
npm install @payarc/payarc-sdk
```


## Usage

Before you can use the Payarc SDK, you need to initialize it with your API key and the URL base point. This is required for authenticating your requests and specifying the endpoint for the APIs. For each environment (prod, sandbox) both parameters have different values. This information should stay on your server and security measures must be taken not to share it with your customers. Provided examples use package `dotenv` to store this information and provide it on the constructor. It is not mandatory to use this approach as your setup could be different.
In case you want to take benefits of candidate merchant functionality you need so called Agent identification token. This token could be obtained from the portal.

```bash
npm install dotenv
```

You have to create `.env` file in root of your project and update the following rows after =
```ini
PAYARC_ENV=''
PAYARC_KEY=''
AGENT_KEY=''
```
You have to create object from SDK to call different methods depends on business needs. Optional you can load `.env` file into configuration by adding
```javascript
require('dotenv').config()
```
then you create instance of the SDK
```javascript
/**
 * Creates an instance of Payarc.
 * @param {string} bearerToken - The bearer token for authentication.Mandatory parameter to construct the object
 * @param {string} [baseUrl=sandbox] - The url of access points possible values prod or sandbox, as sandbox is the default one. Vary for testing playground and production. can be set in environment file too.
 * @param {string} [apiVersion=1] - The version of access points for now 1(it has default value thus could be omitted).
 * @param {string} [version='1.0'] - API version.
 * @param {string} bearerTokenAgent - The bearer token for agent authentication. Only required if you need functionality around candidate merchant
 * 
 */
const payarc = new (require('@payarc/payarc-sdk'))(
    process.env.PAYARC_KEY,
    process.env.PAYARC_ENV,
    undefined,
    undefined,
    process.env.AGENT_KEY
)

```
if no errors you are good to go.

## API Reference
Documentation for existing payment API provided by Payarc can be found on https://docs.payarc.net/
Documentation for existing candidate merchant management API can be found on https://docs.apply.payarc.net/

## Examples
SDK is build around object payarc. From this object you can access properties and function that will support your operations.

### Object payarc.charges
Object payarc.charges is used to manipulate payments in the system. This object has following functions: 
    create - this function will create a payment intent or charge accepting various configurations and parameters. See examples for some use cases. 
    retrieve - this function returns json object 'Charge' with details
    list - returns an object with attribute 'charges' a list of json object holding information for charges and object in attribute 'pagination'
    createRefund - function to perform a refund over existing charge

### Object payarc.customer
Object payarc.customer is representing your customers with personal details, addresses and credit cards and/or bank accounts. Saved for future needs
    create - this function will create object stored in the database for a customer. it will provide identifier unique for each in order to identify and inquiry details. See examples and docs for more information
    retrieve - this function extract details for specific customer from database
    list - this function allows you to search amongst customers you had created. It is possible to search based on some criteria. See examples and documentation for more details  
    update - this function allows you to modify attributes of customer object.

### Object payarc.applications
Object payarc.applications is used by Agents and ISVs to manage candidate merchant when acquiring new customer. As such you can create, list, get details, and manage documents required in boarding process.  
            create - this function add new candidate into database. See documentation for available attributes, possible values for some of them and which are mandatory. 
            list - returns a list of application object representing future merchants. Use this function to find the interested identifier. 
            retrieve - based on identifier or an object returned from list function, this function will return details 
            delete - in case candidate merchant is no longer needed it will remove information for it.
            addDocument - this function is adding base64 encoded document to existing candidate merchant. For different types of document required in the process contact Payarc. See examples how the function could be invoked
            deleteDocument - this function removes document, when document is no longer valid.
            submit - this function initialize the process of sing off contract between Payarc and your client
            

First, initialize the Payarc SDK with your API key:

```javascript
const payarc = new (require('./payarc'))(process.env.PAYARC_KEY);
```

## Creating a Charge

### Example: Create a Charge with Minimum Information

To create a payment(charge) from a customer, minimum information required is:
amount converted in cents,
currency equal to 'usd',
source the credit card which will be debited with the amount above. For credit card minimum needed attributes are card number and expiration date. For full list of attributes see API documentation.
This example demonstrates how to create a charge with the minimum required information:

```javascript
payarc.charges.create({
        amount: 3288, // Amount in cents
        currency: 'usd', // Currency code (e.g., 'usd')
    source:{
        card_number: '4012000098765439', // Payment source (e.g., credit card number)
        exp_month: '03',  //Credit card attributes 
        exp_year: '2025', //Credit card attributes 
        }
    })
        .then(charge => console.log('Success the charge is ',charge))
        .catch(error => console.error('Error detected:',error));
```

### Example: Create a Charge by Token
To create a payment(charge) from a customer, minimum information required is:
amount converted in cents,
currency equal to 'usd',
source an object that has attribute token_id. this can be obtained by the API for token creation.
This example shows how to create a charge using a token:

```javascript
payarc.charges.create({
    amount:1199,
    currency: 'usd',
    source: {
        token_id:'tok_mEL8xxxxLqLL8wYl',
    },
}).then(charge => console.log('Success the charge is ',charge))
.catch(error => console.error('Error detected:',error));
```

### Example: Create a Charge by Card ID

Charge can be generated over specific credit card (cc) if you know the cc's ID and customer's ID to which this card belongs.
This example demonstrates how to create a charge using a card ID:

```javascript
payarc.charges.create({
    amount:1299,
    currency: 'usd',
    source: {
        card_id: 'card_9P1y0cccccccc0vM',
        customer_id: 'cus_DPAnxxxxxxVpKM',
    }
})
.then(charge => console.log('Success the charge is ',charge))
.catch(error => console.error('Error detected:',error))
```

### Example: Create a Charge by Customer ID

This example shows how to create a charge using a customer ID:

```javascript
payarc.charges.create({
    amount:1391,
    currency: 'usd',
    source: {
        customer_id: 'cus_DPAnxxxxxxVpKM',
    }
})
.then(charge => console.log('Success! The charge is:', charge))
.catch(error => console.error('Error detected:', error));
```

### Example: Create a Charge by Bank account ID

This example shows how to create an ACH charge when you know the bank account 
```javascript
payarc.customers.retrieve('cus_AnonymizedCustomerID')
    .then((customer) => {
        customer.charges.create(
        {
            amount:6699,
            sec_code: 'WEB',
            source: {
                bank_account_id: 'bnk_eJjbbbbbblL'
            }
        }
       ).then((ex)=>{console.log('Error detected:', ex)})
    })
```
Example make ACH charge with new bank account. Details for bank account are send in attribute source
```javascript
payarc.customers.retrieve('cus_xMADVnA4jjNpV4nN')
.then((customer) => {
    customer.charges.create(
    {
        amount:7788,
        sec_code: 'WEB',
        source: {
            account_number:'123432575352',
            routing_number:'123345349',
            first_name: 'FirstName III',
            last_name:'LastName III',
            account_type: 'Personal Savings',
        }
    }
   ).then((ex)=>{console.log('Error detected:', ex)})
})
```

## Listing Charges

### Example: List Charges with No Constraints

This example demonstrates how to list all charges without any constraints:

```javascript
payarc.charges.list({})
    .then(charges => console.log(charges))
    .catch(error => console.error(error));
```

## Retrieving a Charge

### Example: Retrieve a Charge

This example shows how to retrieve a specific charge by its ID:

```javascript
payarc.charges.retrieve('ch_AnonymizedChargeID')
.then(charge => console.log('Success! The charge is:', charge))
.catch(error => console.error('Error detected:', error));
```

### Example: Retrieve a ACH Charge

his example shows how to retrieve a specific ACH charge by its ID:

```javascript
payarc.charges.retrieve('ach_D9ehhhhhh08aA')
.then(charge => console.log('Success the charge is ',charge))
.catch(error => console.error('Error detected:',error))
```

## Refunding a Charge

### Example: Refund a Charge

This example demonstrates how to refund a charge:

```javascript
payarc.charges.retrieve('ch_AnonymizedChargeID')
.then((charge) => {
    charge.createRefund({
        reason: 'requested_by_customer',
        description: 'The customer returned the product'
    }).then((obj) => {
        console.log("Refund successful:", obj);
    }).catch(error => console.error('Error detected:', error));
    console.log('Do something else');
})
.catch(error => console.error('Error detected:', error));
```

Alternatively, you can refund a charge using the `createRefund` method on the Payarc instance:

```javascript
payarc.charges.createRefund('ch_AnonymizedChargeID', {
    reason: 'requested_by_customer',
    description: 'The customer returned the product'
}).then((obj) => {
    console.log("Refund successful:", obj);
}).catch(error => console.error('Error detected:', error));
```

### Example: Refund an ACH Charge

This example demonstrates how to refund an ACH charge with charge object:
```javascript
payarc.charges.retrieve('ach_D9ehhhhhh08aA')
    .then(charge => {charge.createRefund({})})
    .catch(error => console.error('Error detected:',error))
```

/This example demonstrates how to refund an ACH charge with charge identifier:
```javascript
payarc.charges.createRefund('ach_D9ehhhhhh08aA',{})
    .then(ch=>console.log('Refunded with',ch))
    .catch(error => console.error('Error detected:',error))
```

## Managing Customers

### Example: Create a Customer with Credit Card Information

This example shows how to create a new customer with credit card information:

```javascript
payarc.customers.create({
    email: 'anon+3@example.com',
    cards: [
        {
            card_source: 'INTERNET',
            card_number: '4012000098765439',
            exp_month: '12',
            exp_year: '2025',
            cvv: 999,
            card_holder_name: 'John Doe',
            address_line1: '123 Main Street',
            city: 'Greenwich',
            state: 'CT',
            zip: '06840',
            country: 'US'
        },
        {
            card_source: 'INTERNET',
            card_number: '4012000098765439',
            exp_month: '12',
            exp_year: '2025',
            cvv: 999,
            card_holder_name: 'John Doe',
            address_line1: '123 Main Street Apt 3',
            city: 'Greenwich',
            state: 'CT',
            zip: '06840',
            country: 'US'
        }
    ]
}).then((obj) => {
    console.log("Customer created:", obj);
}).catch(error => console.error('Error detected:', error));
```

### Example: Update a Customer

This example demonstrates how to update an existing customer's information when only ID is known:

```javascript
payarc.customers.update('cus_AnonymizedCustomerID', {
    name: 'John Doe II',
    description: 'Example customer',
    phone: '1234567890'
}).then((obj) => {
    console.log("Customer updated successfully:", obj);
}).catch(error => console.error('Error detected:', error));
```

### Example: Update an Already Found Customer

This example shows how to update a customer object:

```javascript
payarc.customers.retrieve('cus_AnonymizedCustomerID')
.then((customer) => {
        customer.update({ description: "Senior Example customer" });
})
.catch(error => console.error(error));
```

### Example: List Customers with a Limit

This example demonstrates how to list customers with a specified limit:

```javascript
payarc.customers.list({
    limit: 3
})
.then((response) => {
    const { customers = [] } = response;
    console.log(customers[0].card.data);
})
.catch(error => console.error(error));
```

### Example: Add a New Card to a Customer

This example shows how to add a new card to an existing customer:

```javascript
payarc.customers.retrieve('cus_AnonymizedCustomerID')
.then((customer) => {
        customer.cards.create({ 
            card_source: 'INTERNET',
            card_number: '5146315000000055',
            exp_month: '12',
            exp_year: '2025',
            cvv: 998,
            card_holder_name: 'John Doe',
            address_line1: '123 Main Street Apt 3',
            city: 'Greenwich',
            state: 'CT',
            zip: '06840',
            country: 'US'
        }).then((cc) => {
            console.log('Card added to customer:', cc);
        });
});
```

### Example: Add a New Bank Account to a Customer

This example shows how to add new bank account to a customer. See full list of bank account attributes in API documentation

```javascript
payarc.customers.retrieve('cus_AnonymizedCustomerID')
    .then((customer) => {
       customer.bank_accounts.create({
            account_number:'123456789012',
            routing_number:'123456789',
            first_name: 'John III',
            last_name:'Doe',
            account_type: 'Personal Savings',
            sec_code: 'WEB'
        }).then((res)=>{
            console.log('result from bank account is ', res);
        })
    })
    .catch(error => console.error(error));
```
## Manage Candidate Merchants
### Create new Candidate Merchant
In the process of connecting your clients with Payarc a selection is made based on Payarc's criteria. Process begins with filling information for the merchant and creating an entry in the database. Here is an example how this process could start
```javascript
payarc.applications.create(
    {
        "Lead": 
        {
            "Industry": "cbd",
            "MerchantName": "My applications company",
            "LegalName": "Best Co in w",
            "ContactFirstName": "Joan",
            "ContactLastName": "Dhow",
            "ContactEmail":"contact@mail.com",
            "DiscountRateProgram": "interchange"
        },
        "Owners": [
            {
                "FirstName": "First",
                "LastName": "Last",
                "Title": "President",
                "OwnershipPct": 100,
                "Address":"Somewhere",
                "City": "City Of Test",
                "SSN": "4546-0034",
                "State": "WY",
                "ZipCode":"10102",
                "BirthDate": "1993-06-24",
                "Email": "nikoj@negointeresuva.com",
                "PhoneNo": "2346456784"
            }
        ]
    }
).then((result)=>{console.log('the result is ', result)})
.catch((exep)=>{console.log('We encountered an issue ',exep);})
```
In this example attribute `Lead` is an object representing the business as the attribute `Owners` is and array of objects representing the owners of this business. Note this is the minimum information required. For successful boarding you should provide as much information as you can, for reference see documentation.

### Retrieve Information for Candidate Merchant
To continue with onboarding process you might need to provide additional information or to inquiry existing leads. In SDK existis following functions `list` and `retrieve`. 

List all candidate merchant for current agent
```javascript
payarc.applications.list()
.then((res)=>{console.log('List of applications', res);})
.catch((error)=>{console.log('There is a problem somewhere ', error);})
```
Retrieve data for current candidate merchant
```javascript
payarc.applications.retrieve('appl_vajm67vv9m7bxrlk')
.then((res)=>{console.log('Details for applicant', res)})
.catch((erro)=>{console.log('We have a problem ', erro);})
```
Retrieve data for candidate merchant from a list inc documents
```javascript
payarc.applications.list()
.then((res)=>{
    const applicant = res.slice(-1)[0]
    applicant.retrieve().then((details)=>{console.log('Documents for applicant are', details.Documents)})
})
.catch((error)=>{console.log('There is a problem somewhere ', error);})
```

Update properties of candidate merchant
```javascript
payarc.applications.update('appl_vajm67vv9m7bxrlk',
    {
    "MerchantBankAccountNo":"987396827",
    "MerchantBankRoutingNo":"1848505",
    "BankInstitutionName":"Bank of something"
    })
.then((res)=>{console.log('Update for applicant', res)})
.catch((erro)=>{console.log('We have a problem ', erro);})
```

### Documents management
SDK is providing possibility of adding or removing documents with `addDocument` and `deleteDocument` respectively. Example for adding supportive documents to candidate merchant
```javascript
payarc.applications.list()
    .then((res) => {
        const applicant = res[0]
        applicant.addDocument(
            {
                "DocumentType": "Bank Statement",
                "DocumentName": "sample document 1",
                "DocumentIndex": 12243,
                "DocumentDataBase64": "data:image/jpeg;base64,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"
            }
        ).then((res) => { console.log('Documents added are', res) })
    })
    .catch((error) => { console.log('There is a problem somewhere ', error); })
```
In this example we search for all candidate merchants and on the last added in the system we attach a document (Payarc logo) that will be used in on boarding process. See documentation for document attributes.
In case document is no longer needed you can see those examples
```javascript
payarc.applications.list()
    .then((res) => {
        const applicant = res[0]
        applicant.retrieve().then((details) => {
            const document = (details.Documents && details.Documents.data && details.Documents.data.length) ? details.Documents.data[0] : null
            if (document) {
                document.delete().then((res) => { console.log('Doc deleted with response', res); })
            }
        })
    })
    .catch((error) => { console.log('There is a problem somewhere ', error); })
```
Again we search for the last candidate and remove first found (if exists) document. In case we already know the document ID, for example if we retrieve information for candidate you can use  
```javascript
payarc.applications.deleteDocument('doc_z53dmgo0b6g6wral').then((res)=>{console.log('Document is removed ', res)})
```
### Signature
As agent or ISV the process is completed once the contract between Payarc and your client is sent to this client for signature. Once all documents and data is collected method `submit` of the candidate merchant must be invoked, here is an example 
```javascript
payarc.applications.submit('appl_vajm67vv9m7bxrlk')
.then((res)=>{console.log('Submitted with ', res)})
.catch((erro)=>{console.log('We have a problem ', erro);})
```

## Split Payment

As ISV you can create campaigns to manage financial details around your processing merchants. In the SDK the object representing this functionality is `splitCampaigns` this object has functions to create. list, update campaigns. Here below are examples related to manipulation of campaign.

### List all campaigns

To inquiry all campaigns available for your agent

```javascript
//List all campaign for the agent
payarc.splitCampaigns.list()
.then((res)=>{console.log('Campaigns we found',res);})
.catch((erro)=>{console.log('We have a problem ', erro);})
```
as result a list of campaigns is returned. based on this list you can update details

### List all processing merchants

Use this function to get collection of processing merchants. Later on you can assign campaigns to them

```javascript
//List all processing merchants for the agent
payarc.splitCampaigns.listAccounts()
.then((res)=>{console.log('Merchants we found',res);})
.catch((erro)=>{console.log('We have a problem ', erro);})
```

### Create and retrieve details for campaign

Use this function to create new campaign
```javascript
//Create campaign with minimum information
payarc.splitCampaigns.create({
    name: 'Mega bonus',
    description: "Compliment for my favorite customers",
    note: "Only for VIPs",
    base_charge: 33.33,
    perc_charge: 7.77,
    is_default: '0',
    accounts:[]
})
.then((res)=>{console.log('Campaigns created',res);})
.catch((erro)=>{console.log('We have a problem ', erro);})
```
as result the new campaign is returned use it as an object of reference to `object_id`. IF you need to query details about the campaign see the example below.

```javascript
//Retrieve details for a campaign 
payarc.splitCampaigns.retrieve('cmp_9y86xdrpq07bn0qw')
.then((res)=>{console.log('Campaigns details:',res);})
.catch((erro)=>{console.log('We have a problem ', erro);})

```

### Update campaign details

in case you need to update details of the campaign use `update` function. in the examples below you can reference campaign by id or as an object
```javascript
//Update specific data with id of the campaign note
payarc.splitCampaigns.update('cmp_9y86gddgpq07bn0qw',{notes:'New version of notes'})
.then((res)=>{console.log('Updated campaign details:',res);})
.catch((erro)=>{console.log('We have a problem ', erro);})
```

```javascript
//Update specific data of the campaign note
payarc.splitCampaigns.retrieve('cmp_9y86zmgpq07bn0qw')
.then((campaign)=>{
    campaign.update({notes:'Internal modifications'}).then((res)=>{console.log('I am updated note', res);})
})
.catch((erro)=>{console.log('We have a problem ', erro);})
```



This documentation should help you understand how to use the Payarc SDK to manage charges and customers. If you have any questions, please refer to the Payarc API documentation or contact support.
