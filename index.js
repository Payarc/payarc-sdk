const axios = require('axios');
class Payarc {
    /**
     * Creates an instance of Payarc.
     * @param {string} bearerToken - The bearer token for authentication.
     * @param {string} baseUrl - The url of access points possible values prod or sandbox, as sandbox is the default one. Vary for testing playground and production. can be set in environment file too.
     * @param {string} apiVersion - The version of access points for now 1(it has default value thus could be omitted).
     * @param {string} [version='1.0'] - API version.
     */
    constructor(bearerToken = null, baseUrl = 'sandbox', apiVersion = '/v1/', version = '1.0', bearerTokenAgent = null) {
        // if (!bearerToken) {
        //     throw new Error('Bearer token is required');
        // }        this.bearerToken = bearerToken;
        this.bearerToken = bearerToken;
        this.version = version;
        this.baseURL = (baseUrl === 'prod') ? 'https://api.payarc.net' : (baseUrl === 'sandbox' ? 'https://testapi.payarc.net' : baseUrl) // if prod then prod if sandbox then test else what u send
        this.baseURL = (apiVersion === '/v1/') ? `${this.baseURL}${apiVersion}` : `${this.baseURL}/v${apiVersion}/`
        this.bearerTokenAgent = bearerTokenAgent


        // Initialize the charges object
        this.charges = {
            create: this.createCharge.bind(this),
            retrieve: this.getCharge.bind(this),
            list: this.listCharge.bind(this),
            createRefund: this.refundCharge.bind(this)
        }
        this.customers = {
            create: this.createCustomer.bind(this),
            retrieve: this.retrieveCustomer.bind(this),
            list: this.listCustomer.bind(this),
            update: this.updateCustomer.bind(this),
        }
        this.applications = {
            create: this.addLead.bind(this),
            list: this.applyApps.bind(this),
            retrieve: this.retrieveApplicant.bind(this),
            update: this.updateApplicant.bind(this),
            delete: this.deleteApplicant.bind(this),
            addDocument: this.addApplicantDocument.bind(this),
            submit: this.submitApplicantForSignature.bind(this),
            deleteDocument: this.deleteApplicantDocument.bind(this),
            listSubAgents: this.SubAgents.bind(this)
        }
        this.splitCampaigns = {
            create: this.createCampaign.bind(this),
            list: this.getAllCampaigns.bind(this),
            retrieve: this.getDtlCampaign.bind(this),
            update: this.updateCampaign.bind(this),
            listAccounts: this.getAllAccounts.bind(this)
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
    async createCharge(obj, chargeData) {//sometimes the first attribute is the customer, sometimes the charge data
        try {
            if (chargeData === undefined) {
                chargeData = obj
            }
            if (chargeData.source) {
                const { source, ...rest } = chargeData
                if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
                    chargeData = { ...rest, ...source }
                } else
                    chargeData = { ...rest, source }
            }

            if (obj && obj.object_id !== undefined) {
                chargeData.customer_id = obj.object_id.startsWith('cus_') ? obj.object_id.slice(4) : obj.object_id
            }
            if (chargeData.source && chargeData.source.startsWith('tok_')) {
                chargeData.token_id = chargeData.source.slice(4);
            } else if (chargeData.source && chargeData.source.startsWith('cus_')) {
                chargeData.customer_id = chargeData.source.slice(4);
            } else if (chargeData.source && chargeData.source.startsWith('card_')) {
                chargeData.card_id = chargeData.source.slice(5);
            } else if (chargeData.source && chargeData.source.startsWith('bnk_') || chargeData.sec_code !== undefined) {
                if (chargeData.source && chargeData.source.startsWith('bnk_')) {
                    chargeData.bank_account_id = chargeData.source.slice(4);
                    delete chargeData.source
                }
                if (chargeData.bank_account_id && chargeData.bank_account_id.startsWith('bnk_')) {
                    chargeData.bank_account_id = chargeData.bank_account_id.slice(4);
                }
                chargeData.type = 'debit'
                const resp = await axios.post(`${this.baseURL}achcharges`, chargeData, {
                    headers: { Authorization: `Bearer ${this.bearerToken}` }
                });
                return this.addObjectId(resp.data.data);
            } else if (/^\d/.test(chargeData.source || '')) {
                chargeData.card_number = chargeData.source;
            }
            if (chargeData.token_id && chargeData.token_id.startsWith('tok_')) {
                chargeData.token_id = chargeData.token_id.slice(4);
            }
            if (chargeData.customer_id && chargeData.customer_id.startsWith('cus_')) {
                chargeData.customer_id = chargeData.customer_id.slice(4);
            }
            if (chargeData.card_id && chargeData.card_id.startsWith('card_')) {
                chargeData.card_id = chargeData.card_id.slice(5);
            }
            delete chargeData.source;
            const response = await axios.post(`${this.baseURL}charges`, chargeData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                maxRedirects: 0,
            });
            return this.addObjectId(response.data.data);
        } catch (error) {
            return this.manageError({ source: 'API Create Charge' }, error.response || {});
        }
    }
    async getCharge(chargeId) {

        try {
            if (chargeId.startsWith('ch_')) {
                chargeId = chargeId.slice(3);
                const response = await axios.get(`${this.baseURL}charges/${chargeId}`, {
                    headers: { Authorization: `Bearer ${this.bearerToken}` },
                    params: {
                        include: 'transaction_metadata,extra_metadata',
                    }
                });
                return this.addObjectId(response.data.data)
            }
            if (chargeId.startsWith('ach_')) {
                chargeId = chargeId.slice(4);
                const response = await axios.get(`${this.baseURL}achcharges/${chargeId}`, {
                    headers: { Authorization: `Bearer ${this.bearerToken}` },
                    params: {
                        include: 'review',
                    }
                });
                return this.addObjectId(response.data.data)
            }
            return []
        } catch (error) {
            return this.manageError({ source: 'API Retrieve Charge Info' }, error.response || {});
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
    async listCharge(searchData = {}) {
        const { limit = 25, page = 1, search = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}charges`, {
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
            return { charges, pagination };

        } catch (error) {
            return this.manageError({ source: 'API List charges' }, error.response || {});
        }
    }
    async createCustomer(customerData = {}) {
        try {
            const response = await axios.post(`${this.baseURL}customers`, customerData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            const customer = this.addObjectId(response.data.data);
            if (customerData.cards && customerData.cards.length > 0) {
                const cardTokenPromises = customerData.cards.map(cardData => {
                    return this.genTokenForCard(cardData)
                })
                const cardTokens = await Promise.all(cardTokenPromises);
                if (cardTokens && cardTokens.length) {
                    const attachedCardsPromises = cardTokens.map(token => {
                        return this.updateCustomer(customer.customer_id, { token_id: token.id })
                    })
                    const attachedCards = await Promise.all(attachedCardsPromises)
                    return this.retrieveCustomer(customer.object_id)
                }
            }
            return customer;
        } catch (error) {
            return this.manageError({ source: 'API Create customers' }, error.response || {});
        }
    }
    async retrieveCustomer(customerId) {
        if (customerId.startsWith('cus_')) {
            customerId = customerId.slice(4);
        }
        try {
            const response = await axios.get(`${this.baseURL}customers/${customerId}`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API retrieve customer info' }, error.response || {});
        }
    }
    async genTokenForCard(tokenData = {}) {
        try {
            const response = await axios.post(`${this.baseURL}tokens`, tokenData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return response.data.data
        } catch (error) {
            return this.manageError({ source: 'API for tokens' }, error.response || {});
        }
    }
    async addCardToCustomer(customerId, cardData) {
        try {
            customerId = customerId.object_id ? customerId.object_id : customerId
            if (customerId.startsWith('cus_')) {
                customerId = customerId.slice(4);
            }
            const cardToken = await this.genTokenForCard(cardData)
            const attachedCards = await this.updateCustomer(customerId, { token_id: cardToken.id })
            return this.addObjectId(cardToken.card.data)
        } catch (error) {
            return this.manageError({ source: 'API add card to customer' }, error.response || {});
        }
    }
    async addBankAccToCustomer(customerId, accData) {
        try {
            customerId = customerId.object_id ? customerId.object_id : customerId
            if (customerId.startsWith('cus_')) {
                customerId = customerId.slice(4);
            }
            accData.customer_id = customerId
            const response = await axios.post(`${this.baseURL}bankaccounts`, accData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API BankAccount to customer' }, error.response || {});
        }
    }
    async updateCustomer(customer, custData) {
        customer = customer.object_id ? customer.object_id : customer
        if (customer.startsWith('cus_')) {
            customer = customer.slice(4)
        }
        try {
            const response = await axios.patch(`${this.baseURL}customers/${customer}`, custData, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }
    }
    async listCustomer(searchData = {}) {
        const { limit = 25, page = 1, constraint = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}customers`, {
                headers: { Authorization: `Bearer ${this.bearerToken}` },
                params: {
                    limit,
                    page,
                    ...constraint
                }
            });
            // Apply the object_id transformation to each customer
            const customers = response.data.data.map(customer => {
                return this.addObjectId(customer)
            });
            const pagination = response.data.meta.pagination || {}
            delete pagination['links']
            return { customers, pagination };

        } catch (error) {
            return this.manageError({ source: 'API List customers' }, error.response || {});
        }
    }
    async refundCharge(charge, params) {

        let chargeId = charge.object_id ? charge.object_id : charge
        if (chargeId.startsWith('ch_')) {
            chargeId = chargeId.slice(3);
        }
        if (chargeId.startsWith('ach_')) {// the case of ACH charge
            const result = await this.refundACHCharge(charge, params)
            return result
        }
        try {
            const response = await axios.post(`${this.baseURL}charges/${chargeId}/refunds`, params, {
                headers: { Authorization: `Bearer ${this.bearerToken}` }
            });
            return this.addObjectId(response.data.data);
        } catch (error) {
            return this.manageError({ source: 'API Refund a charge' }, error.response || {});
        }
    }
    async refundACHCharge(charge, params = {}) {
        if (typeof charge === 'object' && charge !== null && !Array.isArray(charge)) {
            //charge is already sn object
        } else {
            charge = await this.getCharge(charge) //charge will become an object
        }
        params.type = 'credit'
        params.amount = params.amount !== undefined ? params.amount : charge.amount
        params.sec_code = params.sec_code !== undefined ? params.sec_code : charge.sec_code
        if (charge.bank_account && charge.bank_account.data && charge.bank_account.data.object_id) {
            params.bank_account_id = (params.bank_account_id !== undefined) ? params.bank_account_id : charge.bank_account.data.object_id;
        }
        if (params.bank_account_id && params.bank_account_id.startsWith('bnk_')) {
            params.bank_account_id = params.bank_account_id.slice(4);
        }
        const resp = await axios.post(`${this.baseURL}achcharges`, params, {
            headers: { Authorization: `Bearer ${this.bearerToken}` }
        });
        return this.addObjectId(resp.data.data);
    }
    // this method is a wrapper of API add-lead
    async addLead(applicant) {
        try {
            if(applicant.agentId && applicant.agentId.startsWith('usr_')){
                applicant.agentId = applicant.agentId.slice(4)
            }
            const resp = await axios.post(`${this.baseURL}agent-hub/apply/add-lead`, applicant, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            });
            return this.addObjectId(resp.data);
        } catch (error) {
            return this.manageError({ source: 'API add lead' }, error.response || {});
        }

    }
    async applyApps() {
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/apply-apps`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                params: {
                    limit: 0,
                    is_archived: 0
                }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API list Apply apps' }, error.response || {});
        }
    }
    async retrieveApplicant(applicant) {
        try {
            let applicantId = applicant.object_id ? applicant.object_id : applicant

            if (applicantId.startsWith('appl_')) {
                applicantId = applicantId.slice(5)
            }
            const response = await axios.get(`${this.baseURL}agent-hub/apply-apps/${applicantId}`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                params: {
                }
            });
            const docs = await axios.get(`${this.baseURL}agent-hub/apply-documents/${applicantId}`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                params: {
                    limit: 0
                }
            });
            delete docs.data.meta
            delete response.data.meta
            response.data.Documents = docs.data
            return this.addObjectId(response.data)

        } catch (error) {
            return this.manageError({ source: 'API Apply apps status' }, error.response || {});
        }
    }
    async updateApplicant(object, newData){
        let dataId = object.object_id ? object.object_id : object
        if (dataId.startsWith('appl_')) {
            dataId = dataId.slice(5)
        }
        try {
            newData = Object.assign({    
                "bank_account_type":"01",
                "slugId":"financial_information",
                "skipGIACT": true}, 
                newData) //Add required properties to update the bank
            const response = await axios.patch(`${this.baseURL}agent-hub/apply-apps/${dataId}`, newData, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            });
            if(response.status === 200){
                return this.retrieveApplicant(dataId)
            }
            return this.addObjectId(response.data)
        } catch (error) {
            return this.manageError({ source: 'API update Application info' }, error.response || {});
        }
    }
    async deleteApplicant(applicant) {
        try {
            let applicantId = applicant.object_id ? applicant.object_id : applicant
            if (applicantId.startsWith('appl_')) {
                applicantId = applicantId.slice(5)
            }
            const resp = await axios.delete(`${this.baseURL}agent-hub/apply/delete-lead`, { 'MerchantCode': applicantId }, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            });
            return this.addObjectId(resp.data.data);
        } catch (error) {
            return this.manageError({ source: 'API Apply apps delete' }, error.response || {});
        }
    }
    async addApplicantDocument(applicant, params) {
        try {
            let applicantId = applicant.object_id ? applicant.object_id : applicant
            if (applicantId.startsWith('appl_')) {
                applicantId = applicantId.slice(5)
            }
            const response = await axios.post(`${this.baseURL}agent-hub/apply/add-documents`,
                {
                    'MerchantCode': applicantId,
                    'MerchantDocuments': [params]
                },
                {
                    headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
                });
            return this.addObjectId(response.data)
        } catch (error) {
            
            return this.manageError({ source: 'API Apply documents add' }, error.response || {});
        }
    }
    async SubAgents() {
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/sub-agents`,
                {
                    headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
                });
            return this.addObjectId(response.data && response.data.data || [])
        } catch (error) {
            return this.manageError({ source: 'API List sub agents' }, error.response || {});
        }
    }
    async deleteApplicantDocument(document) {

        try {
            let documentId = document.object_id ? document.object_id : document
            if (documentId.startsWith('doc_')) {
                documentId = documentId.slice(4)
            }
            // const resp = await axios.delete(`${this.baseURL}agent-hub/apply/delete-documents`, { 'MerchantDocuments': [{ 'DocumentCode': documentId }] }, {
            //     headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            // });
            const resp = await axios.delete(`${this.baseURL}agent-hub/apply/delete-documents`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                data: { 'MerchantDocuments': [{ 'DocumentCode': documentId }] }
            });
            return this.addObjectId(resp.data);
        } catch (error) {
            return this.manageError({ source: 'API Apply document delete' }, error.response || {});
        }
    }
    async submitApplicantForSignature(applicant){
        try {
            let applicantId = applicant.object_id ? applicant.object_id : applicant
            if (applicantId.startsWith('appl_')) {
                applicantId = applicantId.slice(5)
            }
            const response = await axios.post(`${this.baseURL}agent-hub/apply/submit-for-signature`,
                {
                    'MerchantCode': applicantId
                },
                {
                    headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
                });
            return this.addObjectId(response.data)
        } catch (error) {
            return this.manageError({ source: 'API Submit for signature' }, error.response || {});
        }
    }

    // Split Campaigns
    async createCampaign(data){
        try {
            const response = await axios.post(`${this.baseURL}agent-hub/campaigns`,
                data,
                {
                    headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
                });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API Create campaign ...' }, error.response || {});
        }

    }
    async getAllCampaigns(){
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/campaigns`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                params: {
                    limit: 0
                }
            });
            return this.addObjectId(response.data.data)

        } catch (error) {
            return this.manageError({ source: 'API get campaigns status' }, error.response || {});
        }
    }
    async getDtlCampaign(key){
        try {
            let keyId = key.object_id ? key.object_id : key
            if (keyId.startsWith('cmp_')) {
                keyId = keyId.slice(4)
            }
            const response = await axios.get(`${this.baseURL}agent-hub/campaigns/${keyId}`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` },
                params: {
                    limit: 0
                }
            });
            return this.addObjectId(response.data.data)

        } catch (error) {
            return this.manageError({ source: 'API get campaigns status' }, error.response || {});
        }
    }
    async updateCampaign(data, newData){
        let dataId = data.object_id ? data.object_id : data
        if (dataId.startsWith('cmp_')) {
            dataId = dataId.slice(4)
        }
        try {
            const response = await axios.patch(`${this.baseURL}agent-hub/campaigns/${dataId}`, newData, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }
    }
    async getAllAccounts(){
        try {
            const response = await axios.get(`${this.baseURL}account/my-accounts`, {
                headers: { Authorization: `Bearer ${this.bearerTokenAgent}` }
            });
            return this.addObjectId(response.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get all merchants' }, error.response || {});
        }
    }

    addObjectId(object) {
        const handleObject = (obj) => {
            if (obj.id || obj.customer_id) {
                if (obj.object === 'Charge') {
                    obj.object_id = `ch_${obj.id}`
                    obj.createRefund = this.refundCharge.bind(this, obj)
                } else if (obj.object === 'customer') {
                    obj.object_id = `cus_${obj.customer_id}`
                    obj.update = this.updateCustomer.bind(this, obj)
                    obj.cards = {}
                    obj.cards.create = this.addCardToCustomer.bind(this, obj)
                    if (obj.bank_accounts === undefined) {
                        obj.bank_accounts = {}
                    }
                    obj.bank_accounts.create = this.addBankAccToCustomer.bind(this, obj)
                    if (obj.charges === undefined) {
                        obj.charges = {}
                    }
                    obj.charges.create = this.createCharge.bind(this, obj)
                } else if (obj.object === 'Token') {
                    obj.object_id = `tok_${obj.id}`
                } else if (obj.object === 'Card') {
                    obj.object_id = `card_${obj.id}`
                } else if (obj.object === 'BankAccount') {
                    obj.object_id = `bnk_${obj.id}`
                } else if (obj.object === 'ACHCharge') {
                    obj.object_id = `ach_${obj.id}`
                    obj.createRefund = this.refundCharge.bind(this, obj)
                } else if (obj.object === 'ApplyApp') {
                    obj.object_id = `appl_${obj.id}`
                    obj.retrieve = this.retrieveApplicant.bind(this, obj)
                    obj.delete = this.deleteApplicant.bind(this, obj)
                    obj.addDocument = this.addApplicantDocument.bind(this, obj)
                    obj.submit = this.submitApplicantForSignature.bind(this,obj)
                    obj.update = this.updateApplicant.bind(this, obj)
                    obj.listSubAgents = this.SubAgents.bind(this, obj)
                } else if (obj.object === 'ApplyDocuments') {
                    obj.object_id = `doc_${obj.id}`
                    obj.delete = this.deleteApplicantDocument.bind(this, obj)
                } else if(obj.object === 'Campaign'){
                    obj.object_id = `cmp_${obj.id}`
                    obj.update = this.updateCampaign.bind(this, obj)
                    obj.retrieve = this.getDtlCampaign.bind(this, obj)
                } else if(obj.object === 'User'){
                    obj.object_id = `usr_${obj.id}`
                }
            } else if (obj.MerchantCode) {
                obj.object_id = `appl_${obj.MerchantCode}`
                obj.object = 'ApplyApp'
                delete obj.MerchantCode
                obj.retrieve = this.retrieveApplicant.bind(this, obj)
                obj.delete = this.deleteApplicant.bind(this, obj)
                obj.addDocument = this.addApplicantDocument.bind(this, obj)
                obj.submit = this.submitApplicantForSignature.bind(this,obj)
                obj.update = this.updateApplicant.bind(this, obj)
                obj.listSubAgents= this.SubAgents.bind(this,obj)
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
    manageError(seed = {}, error) {
        seed.object = `Error ${this.version}`
        seed.type = 'TODO put here error type'
        seed.errorMessage = error.statusText || 'unKnown'
        seed.errorCode = error.status || 'unKnown'
        seed.errorList = error.data && error.data.errors ? error.data.errors : [];
        seed.errorException = error.data && error.data.exception ? error.data.exception : 'unKnown'
        seed.errorDataMessage = (error.data && error.data.message) || 'unKnown'
        return seed
        throw new Error(seed)
    }
}
module.exports = Payarc;