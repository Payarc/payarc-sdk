const axios = require('axios');
class Payarc{
    /**
     * Creates an instance of Payarc.
     * @param {string} bearerToken - The bearer token for authentication.
     * @param {string} baseUrl - The url of access points. Varay for testing playground and production. can be set in environment file too.
     * @param {string} [version='1.0'] - API version.
     */
    constructor(bearerToken, baseUrl = null, version = '1.0'){
        if (!bearerToken) {
            throw new Error('Bearer token is required');
        }
        this.bearerToken = bearerToken;
        this.version = version;
        this.baseURL = process.env.API_URL;

        // Initialize the charges object
        this.charges = {
            create: this.createCharge.bind(this),
            list: this.listCharge.bind(this),
        }
        this.customers = {
            list: this.listCusomer.bind(this),
        }
    }
    /**
     * Creates a charge.
     * @param {Object} chargeData - The charge data.
     * @param {number} chargeData.amount - The amount to charge, in cents.
     * @param {string} chargeData.currency - The currency in which to charge.
     * @param {string} chargeData.source - The source of the payment.
     * @returns {Promise<Object>} The response from the payment provider.
     */
    async createCharge(chargeData) {
        try {
            if (chargeData.source.startsWith('toc_')) {
                chargeData.token_id = chargeData.source.slice(4);
                delete chargeData.source;
            } else if (chargeData.source.startsWith('cus_')) {
                chargeData.customer_id = chargeData.source.slice(4);
                delete chargeData.source;
            } else if (chargeData.source.startsWith('card_')) {
                chargeData.card_id = chargeData.source.slice(5);
                delete chargeData.source;
            } else if (/^\d/.test(chargeData.source)) {
                chargeData.card_number = chargeData.source;
                delete chargeData.source;
            }
            const response = await axios.post(`${this.baseURL}/v1/charges`, chargeData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data);
        } catch (error) {
            // console.log('Error message:', error.message);
            return this.manageError({source:'API Create Charge'},error.response || {});
            return null;
        }
    }

     /**
     * Lists all charges with optional pagination and search constraints.
     * @param {Object} [searchData] - The search and pagination options.
     * @param {number} [searchData.limit=25] - The number of results to return.
     * @param {number} [searchData.page=1] - The page of results to return.
     * @param {Object} [searchData.search] - Search constraints (e.g., { customer_id: '12345' }).
     * @returns {Promise<Object[]>} The list of charges.
     */
    async listCharge(searchData = {}){
        const { limit = 25, page = 1, search = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}/v1/charges`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                    limit,
                    page,
                    ...search
                }
            });
            // Apply the object_id transformation to each charge
            const charges = response.data.data.map(charge => {
                this.addObjectId(charge);
                return charge;
            });
            const pagination = response.data.meta.pagination || {}
            delete pagination['links']
            return {charges,pagination};
            
        } catch (error) {
            console.error('Error listing charges:', error);
            return null;
        }
    }
    async listCusomer(searchData= {}){
        const { limit = 25, page = 1, search = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}/v1/customers`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                    limit,
                    page,
                    ...search
                }
            });
            // Apply the object_id transformation to each customer
            console.log('response',response)
            const customers = response.data.data.map(customer => {
                return this.addObjectId(customer)
            });
            const pagination = response.data.meta.pagination || {}
            delete pagination['links']
            return {customers,pagination};
            
        } catch (error) {
            // console.log('Error listing customers:', error.response);
            return this.manageError({source:'API List customers'},error.response || {});
        }
    }

    addObjectId(object) {
        function handleObject(obj) {
            if (obj.id || obj.customer_id) {
                if (obj.object === 'Charge') {
                    obj.object_id = `ch_${obj.id}`;
                } else if (obj.object === 'customer') {
                    obj.object_id = `cus_${obj.customer_id}`;
                } else if (obj.object === 'Token') {
                    obj.object_id = `tok_${obj.id}`;
                }
            }
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        handleObject(obj[key]);  // Recursive call for nested objects
                    } else if (Array.isArray(obj[key])) {
                        obj[key].forEach(item => {
                            if (typeof item === 'object' && item !== null) {
                                handleObject(item);  // Recursive call for items in arrays
                            }
                        });
                    }
                }
            }
        }
        handleObject(object);
        return object;
    }
    // addObjectId(object){
    //     if((object.id || object.customer_id) && object.object){
    //         if(object.object === 'Charge'){
    //             object.object_id = `ch_${object.id}`
    //         }
    //         if(object.object === 'customer'){
    //             object.object_id = `cus_${object.customer_id}`
    //         }
    //         if(object.object === 'Token'){
    //             object.object_id = `toc_${object.id}`
    //         }
    //     }
    //     return object
    //     //TODO dive deep inside of object and in case array? of sub-object chnages as well
    // }
    //Function to manage error feedback
     manageError(seed={}, error){
        seed.errorMessage = error.statusText || 'unKnown'
        seed.errorCode = error.status || 'unKnown'
        seed.errorList = error.data.errors || []
        seed.errorException = error.data.exception || 'unKnown'
        return seed
    }
}
module.exports = Payarc;