require("dotenv").config();
const Payarc = require("../index");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const bearerToken = "testBearerToken";
const accessToken = "testAccessToken";
const baseUrl = "http://testBaseUrl";

const paxError = { ErrorMessage: "ABORTED", ErrorCode: 14 };

describe("Payarc Connect Test", () => {
  let payarc;
  let mock;

  beforeAll(() => {
    payarc = new Payarc(bearerToken, "test");
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  /* This must be run 1st! It sets access token in SDK */
  test("login should return access token on succesful login", async () => {
    const successResponse = {
      BearerTokenInfo: {
        AccessToken: accessToken,
      },
      ErrorCode: 0,
      ErrorMessage: "",
    };
    mock.onPost(`${baseUrl}/Login`).reply(200, successResponse);
    const response = await payarc.payarcConnect.login();
    expect(response).toEqual(successResponse);
    expect(payarc.payarcConnectAccessToken).toEqual(accessToken);
  });

  test("login should return error on failed login", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Login" };
    const error = { ErrorMessage: "", ErrorCode: 0 };
    const failedResponse = payarc.payarcConnectError(seed, error);
    mock.onPost(`${baseUrl}/Login`).reply(networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.login();
    expect(response).toEqual(failedResponse);
  });

  test("login should return error on failed login (network error)", async () => {
    const networkErrorCode = 500; // Dont make this 200. See previous test
    const seed = { source: "Payarc Connect Login" };
    const failedResponse = payarc.manageError(seed, {
      status: networkErrorCode,
    });
    mock.onPost(`${baseUrl}/Login`).reply(networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.login();
    expect(response).toEqual(failedResponse);
  });

  test("sale should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.sale(
      "CREDIT",
      "REF123",
      "100",
      "123456"
    );
    expect(response).toEqual(successResponse);
  });

  test("sale should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Sale" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.sale(
      "CREDIT",
      "REF123",
      "100",
      "123456"
    );
    expect(response).toEqual(failedResponse);
  });

  test("void should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.void("123456", "123456");
    expect(response).toEqual(successResponse);
  });

  test("void should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Void" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.void("123456", "123456");
    expect(response).toEqual(failedResponse);
  });

  test("refund should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.refund(
      "100",
      "123456",
      "123456"
    );
    expect(response).toEqual(successResponse);
  });

  test("refund should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Refund" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.refund("123456", "123456");
    expect(response).toEqual(failedResponse);
  });

  test("blind credit should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.blindCredit(
      "REF123",
      "100",
      "Tok123",
      "0000",
      "123456"
    );
    expect(response).toEqual(successResponse);
  });

  test("blind should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Blind Credit" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.blindCredit(
      "REF123",
      "100",
      "Tok123",
      "0000",
      "123456"
    );
    expect(response).toEqual(failedResponse);
  });

  test("auth should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.auth("REF123", "100", "123456");
    expect(response).toEqual(successResponse);
  });

  test("auth should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Auth" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.auth("REF123", "100", "123456");
    expect(response).toEqual(failedResponse);
  });

  test("post auth should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mockTransactionResponse(mock, networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.postAuth(
      "REF123",
      "100",
      "123456"
    );
    expect(response).toEqual(successResponse);
  });

  test("post auth should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Post Auth" };
    const failedResponse = payarc.manageError(seed, paxError);
    mockTransactionResponse(mock, networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.postAuth(
      "REF123",
      "100",
      "123456"
    );
    expect(response).toEqual(failedResponse);
  });

  test("last transaction should return data on successful transaction", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mock
      .onGet(`${baseUrl}/LastTransaction`)
      .reply(networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.lastTransaction("123456");
    expect(response).toEqual(successResponse);
  });

  test("last transaction should return error on fail", async () => {
    const networkErrorCode = 200;
    const seed = { source: "Payarc Connect Last Transaction" };
    const failedResponse = payarc.manageError(seed, paxError);
    mock
      .onGet(`${baseUrl}/LastTransaction`)
      .reply(networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.lastTransaction("123456");
    expect(response).toEqual(failedResponse);
  });

  test("server info should return data on success", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      PaxResponse: "paxResponse",
      ErrorCode: apiErrorCode,
      ErrorMessage: "",
    };
    mock
      .onGet(`${baseUrl}/ServerInfo`)
      .reply(networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.serverInfo();
    expect(response).toEqual(successResponse);
  });

  test("server info error should return error on fail (network error)", async () => {
    const networkErrorCode = 404;
    const seed = { source: "Payarc Connect Server Info" };
    const error = { status: networkErrorCode };
    const failedResponse = payarc.manageError(seed, error);
    mock.onGet(`${baseUrl}/ServerInfo`).reply(networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.serverInfo();
    expect(response).toEqual(failedResponse);
  });

  test("terminals should return data on success", async () => {
    const networkErrorCode = 200;
    const apiErrorCode = 0;
    const successResponse = {
      Terminals: [
        {
          Object: 'TerminalRegistry',
          Id: '12345',
          Terminal: 'Terminal Name',
          Type: 'pax_A920',
          Code: '12345',
          Is_enabled: true,
          Device_id: '12345',
          Pos_identifier: '12345',
          Created_at: '2025-01-29T16:47:23Z',
          Updated_at: '2025-01-29T16:47:23Z'
        }
      ],
      ErrorCode: apiErrorCode,
      ErrorMessage: ''
    };
    mock.onGet(`${baseUrl}/Terminals`).reply(networkErrorCode, successResponse);
    const response = await payarc.payarcConnect.terminals();
    expect(response).toEqual(successResponse);
  });

  test("terminals should return error on fail (network error)", async () => {
    const networkErrorCode = 404;
    const seed = { source: "Payarc Connect Terminals" };
    const error = { status: networkErrorCode };
    const failedResponse = payarc.manageError(seed, error);
    mock.onGet(`${baseUrl}/Terminals`).reply(networkErrorCode, failedResponse);
    const response = await payarc.payarcConnect.terminals();
    expect(response).toEqual(failedResponse);
  });
});

function mockTransactionResponse(mock, errorCode, response) {
  mock.onPost(`${baseUrl}/Transactions`).reply((config) => {
    expect(config.headers.Authorization).toEqual(`Bearer ${accessToken}`);
    return [errorCode, response];
  });
}
