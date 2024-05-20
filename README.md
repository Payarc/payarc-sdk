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

Before you can use the Payarc SDK, you need to initialize it with your API key and the URL base point. This is required for authenticating your requests and specifying the endpoint for the APIs. For each environment (test, playground, production) both parametres have different values. This information should stay on your server and securit masure must be taken not to share it with your customers. Provided examples use package `dotenv` to store this information and provide it on the constructor. It is not mandatory to use this approach as your setup could be different.

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