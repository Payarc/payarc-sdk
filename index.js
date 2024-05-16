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
            if (/^\d/.test(chargeData.source)) {
                chargeData.card_number = chargeData.source;
                delete chargeData.source;
            }
            const response = await axios.post(`${this.baseURL}/v1/charges`, chargeData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data);
        } catch (error) {
            console.error('Error creating charge:', error);
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
    addObjectId(object){
        if(object.id && object.object){
            if(object.object == 'Charge'){
                object.object_id = `ch_${object.id}`
            }
        }
        return object
    }
}
module.exports = Payarc;