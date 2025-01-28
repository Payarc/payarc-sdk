// index.d.ts

/**
 * The Payarc class provides methods to interact with the Payarc API.
 */
import { PayarcCharges } from "./charge";

declare class Payarc {
    /**
     * Creates an instance of Payarc.
     * @param bearerToken - The bearer token for authentication.
     * @param baseUrl - The URL environment ('prod' or 'sandbox') or custom.
     * @param apiVersion - The version of the Payarc API (default '/v1/').
     * @param version - Arbitrary version label used in error objects (default '1.0').
     * @param bearerTokenAgent - Optional bearer token for "agent-hub" endpoints.
     */
    constructor(
      bearerToken?: string | null,
      baseUrl?: string,
      apiVersion?: string,
      version?: string,
      bearerTokenAgent?: string | null
    );
  
    // --- Charges ---
    // createCharge(obj: any, chargeData?: any): Promise<any>;
    // getCharge(chargeId: string): Promise<any>;
    // listCharge(searchData?: {
    //   limit?: number;
    //   page?: number;
    //   search?: Record<string, any>;
    // }): Promise<{ charges: any[]; pagination: any }>;
    // refundCharge(charge: any, params: any): Promise<any>;
    charges: PayarcCharges;

    // --- Customers ---
    createCustomer(customerData?: any): Promise<any>;
    retrieveCustomer(customerId: string): Promise<any>;
    listCustomer(searchData?: {
      limit?: number;
      page?: number;
      constraint?: Record<string, any>;
    }): Promise<{ customers: any[]; pagination: any }>;
    updateCustomer(customer: any, custData: any): Promise<any>;
    addCardToCustomer(customerId: any, cardData: any): Promise<any>;
    addBankAccToCustomer(customerId: any, accData: any): Promise<any>;
  
    // --- ACH / Refunds ---
    refundACHCharge(charge: any, params?: any): Promise<any>;
  
    // --- Tokenization ---
    genTokenForCard(tokenData?: any): Promise<any>;
  
    // --- Applications / "agent-hub" ---
    addLead(applicant: any): Promise<any>;
    applyApps(): Promise<any>;
    retrieveApplicant(applicant: any): Promise<any>;
    updateApplicant(object: any, newData: any): Promise<any>;
    deleteApplicant(applicant: any): Promise<any>;
    addApplicantDocument(applicant: any, params: any): Promise<any>;
    deleteApplicantDocument(document: any): Promise<any>;
    submitApplicantForSignature(applicant: any): Promise<any>;
    SubAgents(): Promise<any>;
  
    // --- Campaigns ---
    createCampaign(data: any): Promise<any>;
    getAllCampaigns(): Promise<any>;
    getDtlCampaign(key: any): Promise<any>;
    updateCampaign(data: any, newData: any): Promise<any>;
    getAllAccounts(): Promise<any>;
  
    // --- Recurring billing (Plans / Subscriptions) ---
    createPlan(data: any): Promise<any>;
    getPlan(params: any): Promise<any>;
    listPlan(params?: any): Promise<any>;
    updatePlan(params: any, newData: any): Promise<any>;
    deletePlan(params: any): Promise<any>;
    createSubscription(params: any, newData?: any): Promise<any>;
    getAllSubscriptions(params?: any): Promise<any>;
    cancelSubscription(params: any): Promise<any>;
    updateSubscription(params: any, newData: any): Promise<any>;
  
    // --- Disputes ---
    listCases(params?: any): Promise<any>;
    getCase(params: any): Promise<any>;
    addDocumentCase(dispute: any, params: any): Promise<any>;
  
    // --- Payarc Connect ---
    pcLogin(): Promise<any>;
    pcSale(tenderType: string, ecrRefNum: string, amount: number, deviceSerialNo: string): Promise<any>;
    pcVoid(payarcTransactionId: string, deviceSerialNo: string): Promise<any>;
    pcRefund(amount: number, payarcTransactionId: string, deviceSerialNo: string): Promise<any>;
    pcBlindCredit(ecrRefNum: string, amount: number, token: string, expDate: string, deviceSerialNo: string): Promise<any>;
    pcAuth(ecrRefNum: string, amount: number, deviceSerialNo: string): Promise<any>;
    pcPostAuth(ecrRefNum: string, origRefNum: string, amount: number, deviceSerialNo: string): Promise<any>;
    pcLastTransaction(deviceSerialNo: string): Promise<any>;
    pcServerInfo(): Promise<any>;
    pcTerminals(): Promise<any>;
  
    // --- Internal helpers ---
    addObjectId(object: any): any;
    manageError(seed: any, error: any): any;
    payarcConnectError(seed: any, data: any): any;
  }
  
  // Because `module.exports = Payarc` in the JS file:
  export = Payarc;
  