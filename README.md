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
### Node.js

```bash
npm install @payarc/payarc-sdk
```
