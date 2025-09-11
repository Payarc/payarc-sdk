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
npm install payarc-sdk
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
const payarc = new (require('payarc-sdk'))(
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
            
### Object payarc.billing
This object is aggregating other objects responsible for recurrent payments. Nowadays they are `plan` and `subscription`.

### Object payarc.billing.plan
This object contains information specific for each plan like identification details, rules for payment request and additional information. This object ahs methods for:
                create - you can programmatically created new objects to meet client's needs,
                list - inquiry available plans,
                retrieve - collect detailed information for a plan,
                update - modify details of a plan,
                delete - remove plan when no longer needed,
                createSubscription: issue a subscription for a customer from a plan.
Based on plans you can create subscription. Time scheduled job will request and collect payments (charges) according plan schedule from customer

### Object payarc.billing.plan.subscription
This abstraction encapsulate information for subscription the link between customer and plan. it has following methods:
                    list - enumerate subscriptions,
                    cancel - stop and cancel active subscription,
                    update - modify details of a subscription


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

## Listing Charges by Agent

### Example: List Charges with No Constraints by Agent (Payfac)

This example demonstrates how to list all charges by agent without any constraints:

```javascript
payarc.charges.listByAgentPayfac({})
    .then(charges => console.log(charges))
    .catch(error => console.error(error));
```

### Example: List Charges with Constraints by Agent (Traditional)

This example demonstrates how to list all charges by agent with date constraints:

```javascript
payarc.charges.listByAgentTraditional({
    from_date: '2025-07-19',
    to_date: '2025-07-22'
  })
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

### Example: Delete a Customer

This example demonstrates how to delete an existing customer when only ID is known:

```javascript
payarc.customers.delete('cus_AnonymizedCustomerID'
}).then((obj) => {
    console.log("Customer deleted successfully:", obj);
}).catch(error => console.error('Error detected:', error));
```

### Example: Delete an Already Found Customer

This example shows how to update a customer object:

```javascript
payarc.customers.retrieve('cus_AnonymizedCustomerID')
.then((customer) => {
        customer.delete();
})
.catch(error => console.error(error));
```

## Manage Disputes
A dispute in the context of payment processing refers to a situation where a cardholder questions the validity of a transaction that appears on their statement. This can lead to a chargeback, where the transaction amount is reversed from the merchant's account and credited back to the cardholder. A cardholder sees a transaction on their account that they believe is incorrect or unauthorized. This could be due to various reasons such as fraudulent activity, billing errors, or dissatisfaction with a purchase. The cardholder contacts their issuing bank to dispute the transaction. They may provide details on why they believe the transaction is invalid. The issuing bank investigates the dispute. This may involve gathering information from the cardholder and reviewing the transaction details. The issuing bank communicates the dispute to the acquiring bank (the merchant's bank) through the card network (in your case Payarc). The merchant is then required to provide evidence to prove the validity of the transaction, such as receipts, shipping information, or communication with the customer. Based on the evidence provided by both the cardholder and the merchant, the issuing bank makes a decision. If the dispute is resolved in favor of the cardholder, a chargeback occurs, and the transaction amount is deducted from the merchant's account and credited to the cardholder. If resolved in favor of the merchant, the transaction stands.
### Inquiry Dispute 
The SDK provide a function to list your disputes. you can provide query parameters to specify the constraints over the function. when sent with no parameters it returns all disputes in the past one month
```javascript
// //list disputes with no constraints
payarc.disputes.list()
    .then((result) => { console.log("Your disputes are:", result) })
    .catch((erro) => { console.log('We have a problem ', erro) })

```

You can get details for a dispute by `retrieve` function. the identifier is returned by `list` function

```javascript
// Retrieve details for dispute 
payarc.disputes.retrieve('dis_MVB1AVdssRM1wAW0')
    .then((result) => { console.log("Your dispute is:", result) })
    .catch((erro) => { console.log('We have a problem ', erro) })

```
### Submit Cases
In order to resolve the dispute in your(merchant's) flavour, the merchant is  required to provide evidence to prove the validity of the transaction, such as receipts, shipping information, or communication with the customer. The SDK provides a function `addDocument` that allows you to provide files and write messages to prove that you have rights to keep the mony for the transaction. First parameter of this function is the identifier of the dispute for which the evidence is. Next parameter is an object with following attributes:
- DocumentDataBase64: base46 representation of the files that will be used as evidence 
- text: short text to describe the evidence
- mimeType: type of the provided file
- message: Description of submitted case
For more information for parameters and their attributes check documentation

```javascript
// Add document to a dispute
const DocumentDataBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIUAAABsCAYAAABEkXF2AAAABHNCSVQICAgIfAhkiAAAAupJREFUeJzt3cFuEkEcx/E/001qUQ+E4NF48GB4BRM9+i59AE16ANlE4wv4Mp5MjI8gZ+ONEMJBAzaWwZsVf2VnstPZpfb7STh06ewu5JuFnSzQ8d5vDfiLa3sHcHiIAoIoIIgCgiggitwbWM/f2vniTe7NoIZ7Dz9Y0X0qy7NHYfbLtn6dfzOoYXPlUl4+IIgCooGXj10ngzM77p81vVmY2Y9vL+xi9Tn4f41HYVZYx3Wb3yws9oWBlw8IooAgCgiigCAKCKKAIAoIooAgCoikGU3nqpvy3qesPvv6+/2+LZfLpHUcsrrPD0cKCKKAIAoIooAgCgiigCAKCOecs7q3iJXbZDLZWVaWZfR4733lLbfZbBbchzZvvV4vy+PmSAFBFBBEAUEUEEQBQRQQRAFR5DzfD81FxMxVpMg9l3HT938fjhQQRAFBFBBEAUEUEEQBQRQQRe5z7SptnYejGkcKCKKAIAoIooAgCgiigCAKiKQoYj6bMB6Pd8aMRqPoz22kfCalzfmXm45nDoIoIIgCgiggiAKCKCCIAiJrFKnfTxHS9vdX5P7+ibZwpIAgCgiigCAKCKKAIAoIooDomNl2352hc+WY3+NYzyf2c345V3EyGNmdwevo8anbr3Lbfu/j+9fndrH69Ofv+48+WtF9JuM4UkAQBQRRQBAFBFFAEAUEUUBUfo9m6jUPzjl7eWr26vRyWVmW9u59GT2+Suo1B4vFImn8/4ojBQRRQBAFBFFAEAUEUUAQBUTHe7/3eorUeYrQ9RSprmP/UtZ/6OP/xfUUqI0oIIgCgiggiqY36Ddz25x/uZZ1PXmcNj60H6H1H/p4sV1F/VvjZx84HJx9IFrl733wexy3U/b3FO7ogR0dD7OsezqdVt4/HFZvNzQ+t9T9C40P6ty9erElfEKsbblnDHNrekYzFu8pIIgCgiggiAKCKCAqzz5Ccr+7T3133fb1DG0//ro4UkAQBQRRQBAFBFFAEAXEb3wL3JblytFeAAAAAElFTkSuQmCC"

payarc.disputes.addDocument('dis_MVB1AVdssRM1wAW0',{'DocumentDataBase64':DocumentDataBase64, text:'It is the true true'})
    .then((result) => { console.log("Your result is:", result) })
    .catch((erro) => { console.log('We have a problem ', erro) })

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
In this example attribute `Lead` is an object representing the business as the attribute `Owners` is and array of objects representing the owners of this business. Note this is the minimum information required. For successful boarding you should provide as much information as you can, for reference see documentation. In some case the logged user has to create application in behalf of some other agent. in this case the `object_id` of this agent must be sent in the object sent to function `payarc.applications.create`.To obtain the list of agent you can use function `listSubAgents` as it is shown on examples:

```javascript
const applicant =
{
    "Lead":
    {
        "Industry": "cbd",
        "MerchantName": "My applications company",
        "LegalName": "Best Co in w",
        "ContactFirstName": "Joan",
        "ContactLastName": "Dhow",
        "ContactTitle": 'sir',
        "ContactEmail": "contact@mail.com",
        "DiscountRateProgram": "interchange",
        "ACHTransactions":false
    },
    "Owners": [
        {
            "FirstName": "First",
            "LastName": "Last",
            "Title": "President",
            "OwnershipPct": 100,
            "Address": "Somewhere",
            "City": "City Of Test",
            "SSN": "4546-0034",
            "State": "WY",
            "ZipCode": "10102",
            "BirthDate": "1993-06-24",
            "Email": "nikoj@negointeresuva.com",
            "PhoneNo": "2346456784"
        }
    ]
}
payarc.applications.listSubAgents()
    .then((result) => {
        if (result.length) {
            applicant.agentId = result[0].object_id //Add agent Id in behalf of which appicon is logged
            payarc.applications.create(
                applicant
            ).then((result) => { console.log('the result is ', result) })
                .catch((exep) => { console.log('We encountered an issue during creation ', exep); })
        }
    })
    .catch((error) => { console.log('We encountered an issue ', error); })
```

### Check the Status of an Application

This example demonstrates how to retrieve the status of an application.

```javascript
payarc.applications.status('appl_vajm67vv9m7bxrlk')
.then((res)=>{console.log('Application status', res)})
.catch((error)=>{console.log('An error occurred', error)})
```

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



## Recurrent Payments Setup
Recurrent payments, also known as subscription billing, are essential for any service-based business that requires regular, automated billing of customers. By setting up recurrent payments through our SDK, you can offer your customers the ability to easily manage subscription plans, ensuring timely and consistent revenue streams. This setup involves creating subscription plans, managing customer subscriptions, and handling automated billing cycles. Below, we outline the steps necessary to integrate recurrent payments into your application using our SDK.

### Creating Subscription Plans
The first step in setting up recurrent payments is to create subscription plans. These plans define the billing frequency, pricing, and any trial periods or discounts. Using our SDK, you can create multiple subscription plans to cater to different customer needs. Here is an example of how to create a plan:
```javascript
const Plan = {
    name: 'Monthly billing regular',
    amount: 999,
    interval: 'month',
    statement_descriptor: '2024 MerchantT. Rglr srvc'
}
payarc.billing.plan.create(Plan)
.then((result)=>{console.log('Created plan is:', result);})
.catch((erro)=>{console.log('We have a problem ', erro);})
```
in this example a new plan is created in attribute `name` client friendly name of the plan must be provided. Attribute `amount` is number in cents. in `interval` you specify how often the request for charge will occurs. Information in `statement_descriptor` will be present in the reason for payment request. For more attributes and details check API documentation.


### Updating Subscription Plan
Once plan is created sometimes it is required details form it to be changed. The SDK allow you to manipulate object `plan` or to refer to the object by ID. here are examples how to change details of a plan"

```javascript
// Update plan when know the object
payarc.billing.plan.list()
    .then((result) => {
        const plan = result[0] || null
        if (plan) {
            const updDetails = { name:'Monthly Regular Billing'}
            plan.update(updDetails)
                .then((result) => { console.log("Plan is updated:", result) })
                .catch((erro) => { console.log('We have a problem ', erro) })
        }
    })
    .catch((erro) => { console.log('We have a problem ', erro); })
```
```javascript
// Update plan when know the ID
const updDetails = { name:'Monthly Regular BBilling'}
payarc.billing.plan.update('plan_d84560e2', updDetails)
    .then((result) => { console.log("Plan is updated:", result) })
    .catch((erro) => { console.log('We have a problem ', erro) })
```

### Creating Subscriptions
Once you have created subscription plans, the next step is to manage customer subscriptions. This involves subscribing customers to the plans they choose and managing their billing information. Our SDK makes it easy to handle these tasks. Here's how you can subscribe a customer to a plan:

```javascript
// Create a subscription over plan object
payarc.billing.plan.list({search:'iron'})
.then((result)=>{
    if(result.length){
        const sub = {
            customer_id:'cus_DPAnVxAKPPjjVpKM'
        }
        result[0].createSubscription(sub)
        .then((subs) => { console.log("New subscription:", subs) })
        .catch((erro) => { console.log('We have a problem ', erro) })
    }
})
.catch((erro)=>{console.log('We have a problem ', erro);})
```
```javascript
// Create a subscription with plan id
payarc.billing.plan.createSubscription('plan_d84560e2',{customer_id:'cus_DPAnVxAKPPjjVpKM'})
    .then((subs) => { console.log("New subscription:", subs) })
    .catch((erro) => { console.log('We have a problem ', erro) })
```
This code subscribes a customer to the premium plan using their saved payment method. The SDK handles the rest, including storing the subscription details and scheduling the billing cycle.

### Listing Subscriptions
To collect already created subscriptions you can use method `list` as in the example 

```javascript
// List all subscriptions
payarc.billing.plan.subscription.list({})
    .then((result) => { 
        console.log("Available subscriptions ", result)
     })
    .catch((erro) => { console.log('We have a problem ', erro) })
```
you can sent parameters to filter on result for example the quantity and the plan
```javascript
// List plan details for 2 subscriptions from a plan
payarc.billing.plan.subscription.list({limit:2, plan:'plan_7186b92f'})
    .then((result) => { 
        console.log("Plan for first subscription ", result[0].plan)
        console.log("Available subscriptions ", result)
        result.map((sub)=>{console.log(sub.plan);})
     })
    .catch((erro) => { console.log('We have a problem ', erro) })
```

### Updating Subscription
To manipulate subscription SDK is providing few methods `update` and `cancel`, both can be used with identifier of subscription or over subscription object. Examples of their invocations:
```javascript
//Cancel subscription with ID
payarc.billing.plan.subscription.cancel('sub_R0lVAjR0VPAjgPrx')
    .then((subs) => { console.log("Cancelled subscription:", subs) })
    .catch((erro) => { console.log('We have a problem ', erro) })

```

```javascript
//Update subscription with ID
payarc.billing.plan.subscription.update('sub_R0lVAjR0VPAjgPrx',{description:'Monthly for VIP'})
    .then((subs) => { console.log("Updated subscription:", subs) })
    .catch((erro) => { console.log('We have a problem ', erro) })
```

## Listing Batches

### Example: List Batch Reports by Agent with Constraints

This example demonstrates how to 
retrieve batch settlement reports for merchants based on a specified date range. The 
response contains detailed transaction and settlement information for each merchant
account within the given date range.

```javascript
payarc.batches.list({
    from_date: '2025-07-19',
    to_date: '2025-07-22'
  })
    .then(batches => console.log(batches))
    .catch(error => console.error(error));
```

### Example: List Batch Report Details by Agent

This example demonstrates how to retrieve
detailed transaction information for a specific merchant’s batch report based on the
Merchant_Account_Number, Batch_Reference_Number, and the specified date. 
It provides a list of individual transactions for that batch, along with batch totals.
[Get parameters for desired batch report here](#example-list-batch-reports-by-agent-with-constraints)

```javascript
payarc.batches.retrieve({
    merchant_account_number: '000000000000000',
    reference_number: '000000000000',
    date: 'YYYY-MM-DD'
  })
    .then(batch => console.log(batch))
    .catch(error => console.error(error));
```

## Listing Deposits

### Example: List Deposits by Agent with Constraints

This example demonstrates how to 
retrieve deposit settlement reports for merchants based on a specified date range. The 
response contains detailed deposit and settlement information for each merchant
account within the given date range.

```javascript
payarc.deposits.list({
    from_date: '2025-07-19',
    to_date: '2025-07-22'
  })
    .then(deposits => console.log(deposits))
    .catch(error => console.error(error));
```
 
# Payarc Connect
The following functionality will pertain only to user who are utilizing the Payarc Connect integration:

### Login
This function must be called and completed before any other functionality can be used. 
```javascript
payarc.payarcConnect
    .login()
    .catch((error) => console.error("Error detected:", error));
```

### Sale
Initiate a sale remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| TenderType | CREDIT, DEBIT |
| ECRRefNum | Unique code for this transaction provided by the user. This code will be used later for **voids.** |
| Amount | Amount to capture. Format is $$$$$$$CC |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
payarc.payarcConnect
    .sale(tenderType = "CREDIT", ecrRefNum = "REF123", amount = "100", deviceSerialNo = "12345")
    .then((result) => {  console.log("Result", result)})
    .catch((error) => console.error("Error:", error))
```

### Void
Initiate a void remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| PayarcTransactionId | Unique code of a previous transaction. Required to do a void. Charge ID on Payarc Portal. |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
    payarc.payarcConnect
    .void(payarcTransactionId = "12345", deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Refund
Initiate a refund remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| Amount | Amount to capture. Format is $$$$$$$CC |
| PayarcTransactionId | Unique code of a previous transaction. Required to do a refund. Charge ID on Payarc Portal. |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
    payarc.payarcConnect
    .refund(amount = "100", payarcTransactionId = "12345", deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Blind Credit
Initiate a blind credit remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| ECRRefNum | Unique code for this transaction provided by the user. |
| Amount | Amount to capture. Format is $$$$$$$CC |
| Token | Required for Refund. Found in PaxResponse.ExtData |
| ExpDate | Required for Refund. Found in PaxResponse.ExtData. Expiration date of card used in sale |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
    payarc.payarcConnect
    .blindCredit(ecrRefNum = "REF123", amount = "100", token = "ABC123", expDate = "0000", deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Auth
Initiate an auth remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| ECRRefNum | Unique code for this transaction provided by the user |
| Amount | Amount to capture. Format is $$$$$$$CC |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
    payarc.payarcConnect
    .auth(ecrRefNum = "Ref123", amount = "100", deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Post Auth
Initiate a post auth remotely on your PAX terminal

| Parameter | Usage |
| --- | --- |
| ECRRefNum | Unique code for this transaction provided by the user |
| OrigRefNum | This number is obtained from the paymentResponse object from an auth transaction. |
| Amount | Amount to capture. Cannot exceed auth amount. If you need to exceed the auth amount, perform another sale and the auth will fall off. Format is $$$$$$$CC |
| DeviceSerialNo | Serial number of your PAX terminal |
```javascript
    payarc.payarcConnect
    .postAuth(ecrRefNum = "Ref456", origRefNum = "123", amount = "100", deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Last Transaction
Returns the response object from the last transaction

```javascript
    payarc.payarcConnect
    .lastTransaction(deviceSerialNo = "12345")
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```
### Server Info
 Returns the status of the server

```javascript
    payarc.payarcConnect
    .serverInfo()
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```

### Terminals
Returns a list of registered terminal for merchant

```javascript
    payarc.payarcConnect
    .terminals()
    .then((result) => {console.log("Result", result);})
    .catch((error) => console.error("Error:", error));
```


This documentation should help you understand how to use the Payarc SDK to manage charges and customers. If you have any questions, please refer to the Payarc API documentation or contact support.
