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

Before you can use the Payarc SDK, you need to initialize it with your API key and the URL base point. This is required for authenticating your requests and specifying the endpoint for the APIs. For each environment (test, playground, production) both parameters have different values. This information should stay on your server and security measures must be taken not to share it with your customers. Provided examples use package `dotenv` to store this information and provide it on the constructor. It is not mandatory to use this approach as your setup could be different.

```bash
npm install dotenv
```

You have to create `.env` file in root of your project and update the following rows after =
```ini
API_URL=''
PAYARC_KEY=''
```
You have to create object from SDK to call different methods depends on business needs. Optional you can load `.env` file into configuration by adding
```javascript
require('dotenv').config()
```
then you create instance of the SDK
```javascript
const payarc = new (require('@payarc/payarc-sdk'))(process.env.PAYARC_KEY)
```
if no errors you are good to go.

## API Reference
Documentation for existing API provided by Payarc can be found on https://docs.payarc.net/

## Examples
SDK is build around object payarc. 

First, initialize the Payarc SDK with your API key:

```javascript
const payarc = new (require('./payarc'))(process.env.PAYARC_KEY);
```

## Creating a Charge

### Example: Create a Charge with Minimum Information

This example demonstrates how to create a charge with the minimum required information:

```javascript
payarc.charges.create({
    amount: 1199, // Amount in cents
    currency: 'usd', // Currency code (e.g., 'usd')
    source: '4012888888881881', // Payment source (e.g., credit card number)
    exp_month: '02',  // Credit card expiration month
    exp_year: '2025', // Credit card expiration year
})
    .then(charge => console.log('Success! The charge is:', charge))
    .catch(error => console.error('Error detected:', error));
```

### Example: Create a Charge by Token

This example shows how to create a charge using a token:

```javascript
payarc.charges.create({
    amount: 1234,
    currency: 'usd',
    source: 'toc_mEL8wNqELqLL8wYl'
})
.then(charge => console.log('Success! The charge is:', charge))
.catch(error => console.error('Error detected:', error));
```

### Example: Create a Charge by Card ID

This example demonstrates how to create a charge using a card ID:

```javascript
payarc.charges.create({
    amount: 1299,
    currency: 'usd',
    customer_id: 'cus_AnonymizedCustomerID',
    source: 'card_AnonymizedCardID'
})
.then(charge => console.log('Success! The charge is:', charge))
.catch(error => console.error('Error detected:', error));
```

### Example: Create a Charge by Customer ID

This example shows how to create a charge using a customer ID:

```javascript
payarc.charges.create({
    amount: 1799,
    currency: 'usd',
    source: 'cus_AnonymizedCustomerID'
})
.then(charge => console.log('Success! The charge is:', charge))
.catch(error => console.error('Error detected:', error));
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

## Refunding a Charge

### Example: Refund a Charge

This example demonstrates how to refund a charge:

```javascript
payarc.charges.retrieve('ch_AnonymizedChargeID')
.then((charge) => {
    charge.doRefund({
        reason: 'requested_by_customer',
        description: 'The customer returned the product'
    }).then((obj) => {
        console.log("Refund successful:", obj);
    }).catch(error => console.error('Error detected:', error));
    console.log('Do something else');
})
.catch(error => console.error('Error detected:', error));
```

Alternatively, you can refund a charge using the `doRefund` method on the Payarc instance:

```javascript
payarc.charges.doRefund('ch_AnonymizedChargeID', {
    reason: 'requested_by_customer',
    description: 'The customer returned the product'
}).then((obj) => {
    console.log("Refund successful:", obj);
}).catch(error => console.error('Error detected:', error));
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

This example demonstrates how to update an existing customer's information:

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

This example shows how to update a customer found through a list query:

```javascript
payarc.customers.list({
    limit: 10,
    constraint: { search: 'Example customer' }
})
.then((respo) => {
    const { customers = [] } = respo;
    console.log('Number of customers:', customers.length);
    if (customers.length) {
        customers[0].update({ description: "Senior Example customer" });
    }
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
payarc.customers.list({
    limit: 10,
    constraint: { search: 'Example customer' }
})
.then((respo) => {
    const { customers = [] } = respo;
    if (customers.length) {
        customers[0].cards.create({ 
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
    }
});
```

This documentation should help you understand how to use the Payarc SDK to manage charges and customers. If you have any questions, please refer to the Payarc SDK documentation or contact support.
