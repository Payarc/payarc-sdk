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

        switch (baseUrl) {
            case 'prod':
                this.payarcConnectBaseUrl = 'https://payarcconnectapi.curvpos.com';
                break;
            case 'sandbox':
                this.payarcConnectBaseUrl = 'https://sandbox.payarcconnectapi.curvpos.dev';
                break;
            case 'test':
                this.payarcConnectBaseUrl = 'http://testBaseUrl';
                break;
        }

        this.payarcConnectAccessToken = ""

        // Initialize the charges object
        this.charges = {
            create: this.createCharge.bind(this),
            retrieve: this.getCharge.bind(this),
            list: this.listCharge.bind(this),
            createRefund: this.refundCharge.bind(this),
            listByAgentPayfac: this.listChargesByAgentPayfac.bind(this),
            listByAgentTraditional: this.listChargesByAgentTraditional.bind(this)
        }
        this.customers = {
            create: this.createCustomer.bind(this),
            retrieve: this.retrieveCustomer.bind(this),
            list: this.listCustomer.bind(this),
            update: this.updateCustomer.bind(this),
            delete: this.deleteCustomer.bind(this),
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
        this.billing /*recurring*/ = {
            plan:{
                create: this.createPlan.bind(this),
                list: this.listPlan.bind(this),
                retrieve: this.getPlan.bind(this),
                update: this.updatePlan.bind(this),
                delete: this.deletePlan.bind(this),
                createSubscription: this.createSubscription.bind(this),
                subscription:{
                    list: this.getAllSubscriptions.bind(this),
                    cancel: this.cancelSubscription.bind(this),
                    update: this.updateSubscription.bind(this)
                }
            }
        }
        this.disputes = {
            list: this.listCases.bind(this),
            retrieve: this.getCase.bind(this),
            addDocument: this.addDocumentCase.bind(this)
        }

        this.payarcConnect = {
            login: this.pcLogin.bind(this),
            sale: this.pcSale.bind(this),
            void: this.pcVoid.bind(this),
            refund: this.pcRefund.bind(this),
            blindCredit: this.pcBlindCredit.bind(this),
            auth: this.pcAuth.bind(this),
            postAuth: this.pcPostAuth.bind(this),
            lastTransaction: this.pcLastTransaction.bind(this),
            serverInfo: this.pcServerInfo.bind(this),
            terminals: this.pcTerminals.bind(this),
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
                    headers: thisrequestHeaders(this.bearerToken)
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
                headers: this.requestHeaders(this.bearerToken),
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
                    headers: this.requestHeaders(this.bearerToken),
                    params: {
                        include: 'transaction_metadata,extra_metadata',
                    }
                });
                return this.addObjectId(response.data.data)
            }
            if (chargeId.startsWith('ach_')) {
                chargeId = chargeId.slice(4);
                const response = await axios.get(`${this.baseURL}achcharges/${chargeId}`, {
                    headers: this.requestHeaders(this.bearerToken),
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
                headers: this.requestHeaders(this.bearerToken),
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
                headers: this.requestHeaders(this.bearerToken)
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
                headers: this.requestHeaders(this.bearerToken),
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
                headers: this.requestHeaders(this.bearerToken)
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
                headers: this.requestHeaders(this.bearerToken)
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
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }
    }
    async deleteCustomer(customer) {
        customer = customer.object_id ? customer.object_id : customer
        if (customer.startsWith('cus_')) {
            customer = customer.slice(4)
        }
        try {
            const response = await axios.delete(`${this.baseURL}customers/${customer}`, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return null
        } catch (error) {
            return this.manageError({ source: 'API delete customer info' }, error.response || {});
        }
    }
    async listCustomer(searchData = {}) {
        const { limit = 25, page = 1, constraint = {} } = searchData;
        try {
            const response = await axios.get(`${this.baseURL}customers`, {
                headers: this.requestHeaders(this.bearerToken),
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
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data);
        } catch (error) {
            return this.manageError({ source: 'API Refund a charge' }, error.response || {});
        }
    }
    async listChargesByAgentPayfac(){
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/merchant-bridge/charges`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
                params: {
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
            return this.manageError({ source: 'API List charges by agent Payfac' }, error.response || {});
        }
    }
    async listChargesByAgentTraditional(params = {}){
        try {
            const response = await axios.get(`${this.baseURL}agent/charges`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
                params: {
                    from_date: params.from_date || '',
                    to_date: params.to_date || ''
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
            return this.manageError({ source: 'API List charges by agent Traditional' }, error.response || {});
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
            headers: this.requestHeaders(this.bearerToken)
        });
        return this.addObjectId(resp.data.data);
    }
    // this method is a wrapper of API add-lead
    async addLead(applicant) {
        try {
            if (applicant.agentId && applicant.agentId.startsWith('usr_')) {
                applicant.agentId = applicant.agentId.slice(4)
            }
            const resp = await axios.post(`${this.baseURL}agent-hub/apply/add-lead`, applicant, {
                headers: this.requestHeaders(this.bearerTokenAgent)
            });
            return this.addObjectId(resp.data);
        } catch (error) {
            return this.manageError({ source: 'API add lead' }, error.response || {});
        }

    }
    async applyApps() {
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/apply-apps`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
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
                headers: this.requestHeaders(this.bearerTokenAgent),
                params: {
                }
            });
            const docs = await axios.get(`${this.baseURL}agent-hub/apply-documents/${applicantId}`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
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
                headers: this.requestHeaders(this.bearerTokenAgent)
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
                headers: this.requestHeaders(this.bearerTokenAgent)
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
                    headers: this.requestHeaders(this.bearerTokenAgent)
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
                    headers: this.requestHeaders(this.bearerTokenAgent)
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
            //     headers: this.requestHeaders(this.bearerTokenAgent)
            // });
            const resp = await axios.delete(`${this.baseURL}agent-hub/apply/delete-documents`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
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
                    headers: this.requestHeaders(this.bearerTokenAgent)
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
                    headers: this.requestHeaders(this.bearerTokenAgent)
                });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API Create campaign ...' }, error.response || {});
        }
    }
    async getAllCampaigns(){
        try {
            const response = await axios.get(`${this.baseURL}agent-hub/campaigns`, {
                headers: this.requestHeaders(this.bearerTokenAgent),
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
                headers: this.requestHeaders(this.bearerTokenAgent),
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
                headers: this.requestHeaders(this.bearerTokenAgent)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }
    }
    async getAllAccounts(){
        try {
            const response = await axios.get(`${this.baseURL}account/my-accounts`, {
                headers: this.requestHeaders(this.bearerTokenAgent)
            });
            return this.addObjectId(response.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get all merchants' }, error.response || {});
        }
    }

    //Recurrent payments
    async createPlan(data){
        if(!data.currency){
            data.currency = 'usd'
        }
        if(!data.plan_type){
            data.plan_type = 'digital'
        }
        try {
            const response = await axios.post(`${this.baseURL}plans`,
                data,
                {
                    headers: this.requestHeaders(this.bearerToken)
                });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API Create plan ...' }, error.response || {});
        }
    }
    async getPlan(params){
        const data = params.object_id? params.object_id:params
        try {
            const response = await axios.get(`${this.baseURL}plans/${data}`, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get plan details' }, error.response || {});
        }

    }
    async listPlan(params){
        try {
            if(!params){
                params = {}
            }
            if(!params.limit){
                params.limit = "99999"}
            const response = await axios.get(`${this.baseURL}plans`, {
                headers: this.requestHeaders(this.bearerToken),
                params:{...params}
            });
            return this.addObjectId(response.data.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get all plans' }, error.response || {});
        }
    }
    async updatePlan(params, newData){
        const dataId = params.object_id? params.object_id:params
        try {
            const response = await axios.patch(`${this.baseURL}plans/${dataId}`, newData, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }
    }
    async deletePlan(params) {
        const data = params.object_id ? params.object_id : params
    }
    async getAllSubscriptions(params){
        try {
            if(!params){
                params = {}
            }
            if(!params.limit){
                params.limit = "99999"}
            const response = await axios.get(`${this.baseURL}subscriptions`, {
                headers: this.requestHeaders(this.bearerToken),
                params:{...params}
            });
            return this.addObjectId(response.data.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get all subscriptions' }, error.response || {});
        }
    }
    async createSubscription(params, newData){

        try {
            const dataId = params.object_id? params.object_id:params
            if(!newData){
                newData = {}
            }
            newData.plan_id = dataId
            newData.customer_id = newData.customer_id.startsWith('cus_') ? newData.customer_id.slice(4) : newData.customer_id
             const response = await axios.post(`${this.baseURL}subscriptions`, newData, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API Create subscription' }, error.response || {});
        }
    }
    async cancelSubscription(params){
        try {
            let dataId = params.object_id? params.object_id:params
            dataId = dataId.startsWith('sub_') ? dataId.slice(4) : dataId
            const response = await axios.patch(`${this.baseURL}subscriptions/${dataId}/cancel`, {}, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }

    }
    async updateSubscription(params, newData){
        try {
            let dataId = params.object_id? params.object_id:params
            dataId = dataId.startsWith('sub_') ? dataId.slice(4) : dataId
            const response = await axios.patch(`${this.baseURL}subscriptions/${dataId}`, newData, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.data)
        } catch (error) {
            return this.manageError({ source: 'API update customer info' }, error.response || {});
        }

    }
    async listCases(params) {
        const formatDate = (date) => date.toISOString().split('T')[0]; //function to convert dates
        try {
            if (!params) {
                const currentDate = new Date()
                const tomorrowDate = formatDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))
                currentDate.setMonth(currentDate.getMonth() - 1)
                const lastMonthDate = formatDate(currentDate)
                params = {
                    'report_date[gte]': lastMonthDate,
                    'report_date[lte]': tomorrowDate
                }
            }

            const response = await axios.get(`${this.baseURL}cases`, {
                headers: this.requestHeaders(this.bearerToken),
                params: { ...params }
            });
            return this.addObjectId(response.data.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get all disputes' }, error.response || {});
        }
    }
    async getCase(params) {
        let data = params.object_id ? params.object_id : params
        data = data.startsWith('dis_') ? data.slice(4) : data
        try {
            const response = await axios.get(`${this.baseURL}cases/${data}`, {
                headers: this.requestHeaders(this.bearerToken)
            });
            return this.addObjectId(response.data.primary_case.data || {})

        } catch (error) {
            return this.manageError({ source: 'API get dispute details' }, error.response || {});
        }
    }
    async addDocumentCase(dispute, params) {
        try {
            let disputeId = dispute.object_id ? dispute.object_id : dispute
            if (disputeId.startsWith('dis_')) {
                disputeId = disputeId.slice(4)
            }
            let headers = {}
            let formData = '';
            let formDataBuffer = null
            if (params && params.DocumentDataBase64) {
                const binaryFile = Buffer.from(params.DocumentDataBase64, 'base64')
                const boundary = '----WebKitFormBoundary' + '3OdUODzy6DLxDNt8' //Create a unique boundary

                formData += `--${boundary}\r\n`;
                formData += 'Content-Disposition: form-data; name="file"; filename="filename1.png"\r\n';
                formData += `Content-Type: ${ params.mimeType || 'application/pdf'}\r\n\r\n`; 
                formData += binaryFile.toString('binary');
                formData += `\r\n--${boundary}--\r\n`;
                if (params.text) {
                    formData += `--${boundary}\r\n`;
                    formData += 'Content-Disposition: form-data; name="text"\r\n\r\n';
                    formData += params.text
                    formData += `\r\n--${boundary}--\r\n`;
                }
                // Convert formData to a buffer
                formDataBuffer = Buffer.from(formData, 'binary');

                headers = {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': formDataBuffer.length,
                };

            }

            const requestHeaders = this.requestHeaders(this.bearerToken);
            const baseHeaders = { ...requestHeaders, ...headers };

            const response = await axios.post(`${this.baseURL}cases/${disputeId}/evidence`,
                formDataBuffer
                ,
                {
                    headers: baseHeaders
                });

            const subResponse = await axios.post(`${this.baseURL}cases/${disputeId}/submit`,

                {
                    message: `${params.message || 'Case number#: xxxxxxxx, submitted by SDK'}` 
                }
                ,
                {
                    headers: this.requestHeaders(this.bearerToken)
                });
            return this.addObjectId(response.data)
        } catch (error) {
            return this.manageError({ source: 'API Dispute documents add' }, error.response || {});
        }
    }

    async pcLogin(){
        const seed = { source: 'Payarc Connect Login' }
        try{
            const requestBody = {
                SecretKey: this.bearerToken
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Login`, requestBody)
            const accessToken = response.data?.BearerTokenInfo?.AccessToken
        
            if(accessToken){ 
                this.payarcConnectAccessToken = accessToken
            } else {
                return this.payarcConnectError(seed, response.data)
            }

            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }


    async pcSale(tenderType, ecrRefNum, amount, deviceSerialNo){
        const seed = { source: 'Payarc Connect Sale' }
        try {
            const requestBody = {
                TenderType: tenderType,
                TransType: "SALE",
                ECRRefNum: ecrRefNum,
                Amount: amount,
                DeviceSerialNo: deviceSerialNo
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcVoid(payarcTransactionId, deviceSerialNo){
        const seed = { source: 'Payarc Connect Void' }
        try {
            const requestBody = {
                TransType: "VOID",
                PayarcTransactionId: payarcTransactionId,
                DeviceSerialNo: deviceSerialNo
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcRefund(amount, payarcTransactionId, deviceSerialNo){
        const seed = { source: 'Payarc Connect Refund' }
        try {
            const requestBody = {
                TransType: "REFUND",
                Amount: amount,
                PayarcTransactionId: payarcTransactionId,
                DeviceSerialNo: deviceSerialNo
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcBlindCredit(ecrRefNum, amount, token, expDate, deviceSerialNo){
        const seed = { source: 'Payarc Connect Blind Credit' }
        try {
            const requestBody = {
                TransType: "RETURN",
                ECRRefNum: ecrRefNum,
                Amount: amount,
                Token: token,
                ExpDate: expDate,
                DeviceSerialNo: deviceSerialNo,
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcAuth(ecrRefNum, amount, deviceSerialNo){
        const seed = { source: 'Payarc Connect Auth' }
        try {
            const requestBody = {
                TransType: "AUTH",
                ECRRefNum: ecrRefNum,
                Amount: amount,
                DeviceSerialNo: deviceSerialNo,
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcPostAuth(ecrRefNum, origRefNum, amount, deviceSerialNo){
        const seed = { source: 'Payarc Connect Post Auth' }
        try {
            const requestBody = {
                TransType: "POSTAUTH",
                ECRRefNum: ecrRefNum,
                OrigRefNum: origRefNum,
                Amount: amount,
                DeviceSerialNo: deviceSerialNo,
            };
            const response = await axios.post(`${this.payarcConnectBaseUrl}/Transactions`, requestBody, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcLastTransaction(deviceSerialNo){
        const seed = { source: 'Payarc Connect Last Transaction' }
        try {
            const response = await axios.get(`${this.payarcConnectBaseUrl}/LastTransaction`, {
                headers: this.requestHeaders(this.payarcConnectAccessToken),
                params: { DeviceSerialNo: deviceSerialNo }
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcServerInfo(){
        const seed = { source: 'Payarc Connect Server Info' }
        try {
            const response = await axios.get(`${this.payarcConnectBaseUrl}/ServerInfo`);
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
        }
    }

    async pcTerminals(){
        const seed = { source: 'Payarc Connect Terminals' }
        try {
            const response = await axios.get(`${this.payarcConnectBaseUrl}/Terminals`, {
                headers: this.requestHeaders(this.payarcConnectAccessToken)
            });
            if(response.data?.ErrorCode != 0){
                return this.payarcConnectError(seed, response.data)
            }
            return response.data
        } catch (error) {
            return this.manageError(seed, error.response || {});
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
                    obj.delete = this.deleteCustomer.bind(this,obj)
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
                    obj.submit = this.submitApplicantForSignature.bind(this, obj)
                    obj.update = this.updateApplicant.bind(this, obj)
                    obj.listSubAgents = this.SubAgents.bind(this, obj)
                } else if (obj.object === 'ApplyDocuments') {
                    obj.object_id = `doc_${obj.id}`
                    obj.delete = this.deleteApplicantDocument.bind(this, obj)
                } else if (obj.object === 'Campaign') {
                    obj.object_id = `cmp_${obj.id}`
                    obj.update = this.updateCampaign.bind(this, obj)
                    obj.retrieve = this.getDtlCampaign.bind(this, obj)
                } else if (obj.object === 'User') {
                    obj.object_id = `usr_${obj.id}`
                } else if (obj.object === 'Subscription') {
                    obj.object_id = `sub_${obj.id}`
                    obj.cancel = this.cancelSubscription.bind(this, obj)
                    obj.update = this.updateSubscription.bind(this, obj)
                } else if (obj.object === "Cases") {
                    obj.object = "Dispute"
                    obj.object_id = `dis_${obj.id}`
                }
            } else if (obj.MerchantCode) {
                obj.object_id = `appl_${obj.MerchantCode}`
                obj.object = 'ApplyApp'
                delete obj.MerchantCode
                obj.retrieve = this.retrieveApplicant.bind(this, obj)
                obj.delete = this.deleteApplicant.bind(this, obj)
                obj.addDocument = this.addApplicantDocument.bind(this, obj)
                obj.submit = this.submitApplicantForSignature.bind(this, obj)
                obj.update = this.updateApplicant.bind(this, obj)
                obj.listSubAgents = this.SubAgents.bind(this, obj)
            } else if (obj.plan_id) { //This is plan object
                obj.object_id = obj.plan_id
                obj.object = 'Plan'
                delete obj.plan_id
                //add functions
                obj.retrieve = this.getPlan.bind(this, obj)
                obj.update = this.updatePlan.bind(this, obj)
                obj.delete = this.deletePlan.bind(this, obj)
                obj.createSubscription = this.createSubscription.bind(this, obj)
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

    requestHeaders(token) {
        return {
            Authorization: `Bearer ${token}`,
            'user-agent': `sdk-nodejs/${this.version}`
        }
    }

    payarcConnectError(seed, data){
        const error = {
            statusText: data.ErrorMessage,
            status: data.ErrorCode,
        } 
        return this.manageError(seed, error)
    }

}
module.exports = Payarc;
