// charge.d.ts

/**
 * Input parameters when creating a new charge.
 */
export interface ChargeCreateData {
    amount: number;
    currency: string;
    source?: string;
    // ...any additional fields...
    [key: string]: any;
}

/**
 * A single Charge object returned from API.
 */
export interface Charge {
    object: "Charge" | "ACHCharge" | string;
    id: string;
    object_id: string;
    amount: number;
    amount_approved: number;
    amount_refunded: number;
    amount_captured: number;
    amount_voided: number;
    application_fee_amount: number;
    tip_amount: number;
    payarc_fees: number;
    type: string;
    customer_email?: string | null;
    net_amount?: number;
    captured?: number;
    is_refunded?: number;
    status: string;
    auth_code?: string | null;
    failure_code?: string | null;
    failure_message?: string | null;
    charge_description: string | null;
    kount_details: string | null;
    kount_status: string | null;
    statement_description: string | null;
    invoice: string | null;
    under_review: number;
    created_at: number;
    updated_at: number;
    email: string | null;
    phone_number: string | null;
    card_level: string;
    sales_tax: number | null;
    purchase_order: number | null;
    supplier_reference_number: number | null;
    customer_ref_id: number | null;
    ship_to_zip: number | null;
    amex_descriptor: number | null;
    customer_vat_number: string | null;
    summary_commodity_code: string | null;
    shipping_charges: number | null;
    duty_charges: number | null;
    ship_from_zip: number | null;
    destination_country_code: string | null;
    vat_invoice: string | null;
    order_date: string | null;
    tax_category: string | null;
    tax_type: string | null;
    tax_rate: number | null;
    tax_amount: number | null;
    created_by: string;
    terminal_register: number | null;
    amex_level3: any;
    tip_amount_refunded: number | null;
    sales_tax_refunded: number | null;
    shipping_charges_refunded: number | null;
    duty_charges_refunded: number | null;
    pax_reference_number: number | null;
    refund_reason: string | null;
    refund_description: string | null;
    surcharge: number;
    toll_amount: number | null;
    airport_fee: number | null;
    health_care: number | null;
    health_care_type: string | null;
    prescription_amount: number | null;
    vision_amount: number | null;
    clinic_amount: number | null;
    dental_amount: number | null;
    industry_type: number | null;
    void_reason: string | null;
    void_description: string | null;
    server_id: number | null;
    external_invoice_id: number | null;
    external_order_id: number | null;
    tsys_response_code: string;
    host_response_code: string;
    host_response_message: string;
    emv_issuer_scripts: string | null;
    emv_issuer_authentication_data: string | null;
    host_reference_number: string;
    sale_terminal_id: string | null;
    sale_mid: string | null;
    edc_type: string | null;
    ecr_reference_number: string | null;
    host_transaction_identifier: string;
    do_not_send_email_to_customer: 0 | 1;
    do_not_send_sms_to_customer: 0 | 1;
    card?: {
        data: CardData;
    };
    refund?: {
        data: any[];
    };
    transaction_metadata?: {
        data: TransactionMeta[];
    };
    extra_metadata?: {
        data: any[];
    };
    createRefund(charge: string | Charge, params?: RefundParams): Promise<Charge>;
    // add any other fields as needed
    [key: string]: any;
}
/**
 * Model of card entity
 */
export interface CardData {
    object: 'Card' | string;
    object_id: string;
    id: string;
    address1: string;
    address2: string | null;
    card_source: string;
    card_holder_name: string;
    is_default: 0 | 1;
    exp_month: string;
    exp_year: string;
    is_verified: 0 | 1;
    fingerprint: string;
    city: string;
    state: string;
    zip: number | null;
    brand: string;
    last4digit: number;
    first6digit: number;
    country: string;
    avs_status: string | null;
    cvc_status: string;
    address_check_passed: 0 | 1;
    zip_check_passed: 0 | 1;
    customer_id: string | null;
    created_at: number;
    updated_at: number;
    card_type: string;
    bin_country: string;
    bank_name: string | null;
    bank_website: string | null;
    bank_phone: string | null;
    // add any other fields as needed
    [key: string]: any;
}

export interface TransactionMeta {
    object: "TransactionMeta" | string;
    id: string;
    key: string;
    signature: string | null;
    value: string;
    // add any other fields as needed
    [key: string]: any;
}


/**
 * A typical paginated list response for charges, if applicable.
 */
export interface ChargeListResponse {
    charges: Charge[];
    pagination: {
        current_page: number;
        total_pages: number;
        total: number;
        // add any other fields as needed
        [key: string]: any;
    };
}

/**
 * Parameters for refunding a charge.
 */
export interface RefundParams {
    amount?: number;
    reason?: string;
    // ...any additional fields...
    [key: string]: any;
}

/**
 * Represents the "charges" sub-object on the Payarc class.
 * Exposes exactly four methods: create, retrieve, list, createRefund.
 */
export interface PayarcCharges {
    create(obj: unknown, chargeData?: ChargeCreateData): Promise<Charge>;
    retrieve(chargeId: string): Promise<Charge>;
    list(searchData?: {
        limit?: number;
        page?: number;
        search?: Record<string, any>;
    }): Promise<ChargeListResponse>;
    createRefund(charge: string | Charge, params?: RefundParams): Promise<Charge>;
}
