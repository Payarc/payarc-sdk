# Payarc SDK

The Payarc SDK allows developers to integrate Payarc's payment processing capabilities into their applications with ease. This SDK provides a comprehensive set of APIs to handle transactions, customer management, and more.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the Payarc SDK, you need to configure your npm to use the Payarc registry. Create a `.npmrc` file in your project root and add the following directives:

```text
@payarc:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=TOKEN_PROVIDED_BY_PAYARC
``` 
Replace TOKEN_PROVIDED_BY_PAYARC with the actual token provided by Payarc.

Then you can install the Payarc SDK using npm (for Node.js projects).

```bash
npm install @payarc/payarc-sdk
```


## Usage

Before you can use the Payarc SDK, you need to initialize it with your API key and the URL base point. This is required for authenticating your requests and specifying the endpoint for the APIs. For each environment (prod, sandbox) both parameters have different values. This information should stay on your server and security measures must be taken not to share it with your customers. Provided examples use package `dotenv` to store this information and provide it on the constructor. It is not mandatory to use this approach as your setup could be different.

```bash
npm install dotenv
```

You have to create `.env` file in root of your project and update the following rows after =
```ini
PAYARC_ENV=''
PAYARC_KEY=''
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
 */
const payarc = new (require('@payarc/payarc-sdk'))(process.env.PAYARC_KEY)

```
if no errors you are good to go.

## API Reference
Documentation for existing API provided by Payarc can be found on https://docs.payarc.net/

## Examples
SDK is build around object payarc. From this object you can access properties and function that will support your operations.
Object payarc.charges is used to manipulate payments in the system. This object has following functions: 
    create - this function will create a payment intent or charge accepting various configurations and parameters. See examples for some usecase. 
    retrieve - this function returns json object 'Charge' with details
    list - returns an object with attribute 'charges' a list of json object holding information for charges and object in attribute 'pagination'
    createRefund - function to perform a refund over existing charge

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

This example shows how to create an ACH charge when you know the bank account o
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
// Example make ACH charge with new bank account
// payarc.customers.retrieve('cus_xMADVnA4jjNpV4nN')
// .then((customer) => {
//     customer.charges.create(
//     {
//         amount:7788,
//         sec_code: 'WEB',
//         source: {
//             account_number:'123432575352',
//             routing_number:'123345349',
//             first_name: 'FirstName III',
//             last_name:'LastName III',
//             account_type: 'Personal Savings',
//         }
//     }
//    ).then((ex)=>{console.log('Exxxx', ex)})
// })


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


This documentation should help you understand how to use the Payarc SDK to manage charges and customers. If you have any questions, please refer to the Payarc SDK documentation or contact support.
