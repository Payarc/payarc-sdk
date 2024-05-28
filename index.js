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
            retrieve: this.getCharge.bind(this),
            list: this.listCharge.bind(this),
            doRefund: this.refundCharge.bind(this)
        }
        this.customers = {
            create: this.createCustomer.bind(this),
            retrieve: this.retreiveCustomer.bind(this),
            list: this.listCustomer.bind(this),
            update: this.updateCustomer.bind(this),
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
            return this.manageError({source:'API Create Charge'},error.response || {});
            return null;
        }
    }
    async getCharge(chargeId){
        if (chargeId.startsWith('ch_')) {
            chargeId = chargeId.slice(3);
            }
        try {
            const response = await axios.get(`${this.baseURL}/v1/charges/${chargeId}`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                    include:'transaction_metadata,extra_metadata',
                }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({source:'API Retreive Charge Info'},error.response || {}); 
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
            return this.manageError({source:'API List charges'},error.response || {});
        }
    }
    async createCustomer(sutomerData = {}){
        try {
            const response = await axios.post(`${this.baseURL}/v1/customers`, sutomerData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            const customer = this.addObjectId(response.data.data);
            if (sutomerData.cards && sutomerData.cards.length > 0) {
                const cardTokenPromises = sutomerData.cards.map(cardData => {
                    return this.genTokenForCard(cardData)
                })
                const cardTokens = await Promise.all(cardTokenPromises);
                if(cardTokens && cardTokens.length){
                    const attachedCardsPromises = cardTokens.map( token =>{
                        return this.updateCustomer(customer.customer_id, {token_id: token.id})
                    })
                    const attachedCards = await Promise.all(attachedCardsPromises)
                   return this.addObjectId(this.retreiveCustomer(customer.object_id))
                }
            }
        return customer;
        } catch (error) {
            return this.manageError({source:'API Create customers'},error.response || {});
        }
    }
    async retreiveCustomer(customerId){
        if (customerId.startsWith('cus_')) {
            customerId = customerId.slice(4);
            }
            try {
                const response = await axios.get(`${this.baseURL}/v1/customers/${customerId}`, {
                    headers: { Authorization: `Bearer ${this.bearerToken}` },
                    params: {
                    }
                });
                return response.data.data
            } catch (error) {
                return this.manageError({source:'API retreive customer info'},error.response || {});
            }
    }
    async genTokenForCard(tokenData = {}){
        try {
            const response = await axios.post(`${this.baseURL}/v1/tokens`, tokenData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return response.data.data
        } catch (error) {
            return this.manageError({source:'API for tokens'},error.response || {});
        }
    }
    async addCardToCustomer(customerId, cardData){
        try {
            customerId = customerId.object_id?customerId.object_id:customerId
            if (customerId.startsWith('cus_')) {
                customerId = customerId.slice(4);
            }
            const cardToken =  await this.genTokenForCard(cardData)
            const attachedCards = await this.updateCustomer(customerId, {token_id: cardToken.id})
            return this.addObjectId(cardToken.card.data)
        } catch (error) {
            return this.manageError({source:'API add card to customer'},error.response || {});
        }
    }
    async updateCustomer(customer, custData){
        customer = customer.object_id?customer.object_id:customer
        if(customer.startsWith('cus_')){
            customer = customer.slice(4)
        }
        try {
            const response = await axios.patch(`${this.baseURL}/v1/customers/${customer}`, custData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({source:'API update customer info'},error.response || {});
        }
    }
    async listCustomer(searchData= {}){
        const { limit = 25, page = 1, constraint = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}/v1/customers`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                    limit,
                    page,
                    ...constraint
                }
            });
            const customers = response.data.data.map(customer => {
                return this.addObjectId(customer)
            });
            const pagination = response.data.meta.pagination || {}
            delete pagination['links']
            return {customers,pagination};
            
        } catch (error) {
            return this.manageError({source:'API List customers'},error.response || {});
        }
    }
    async refundCharge(charge, params){
        let chargeId = charge.object_id?charge.object_id:charge
        if (chargeId.startsWith('ch_')) {
            chargeId = chargeId.slice(3);
            }
        try{
                const response = await axios.post(`${this.baseURL}/v1/charges/${chargeId}/refunds`, params, {
                    headers: { Authorization: `Bearer ${this.bearerToken}` }
                });
            return this.addObjectId(response.data.data);
        } catch (error) {
            return this.manageError({source:'API Refund a charge'},error.response || {});
        }
    }
    addObjectId(object) {
        const handleObject =(obj) => {
            if (obj.id || obj.customer_id) {
                if (obj.object === 'Charge') {
                    obj.object_id = `ch_${obj.id}`
                    obj.doRefund = this.refundCharge.bind(this,obj)
                } else if (obj.object === 'customer') {
                    obj.object_id = `cus_${obj.customer_id}`
                    obj.update = this.updateCustomer.bind(this,obj)
                    obj.cards = {}
                    obj.cards.create = this.addCardToCustomer.bind(this, obj)
                } else if (obj.object === 'Token') {
                    obj.object_id = `tok_${obj.id}`
                } else if (obj.object === 'Card') {
                    obj.object_id = `card_${obj.id}`
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

    //Function to manage error feedback
     manageError(seed={}, error){
        seed.object = `Error ${this.version}`
        seed.errorMessage = error.statusText || 'unKnown'
        seed.errorCode = error.status || 'unKnown'
        seed.errorList = error.data && error.data.errors ? error.data.errors : [];
        seed.errorException = error.data && error.data.exception ? error.data.exception : 'unKnown'
        seed.errorDataMessage = (error.data && error.data.message) || 'unKnown'
        return seed
    }
}
module.exports = Payarc;