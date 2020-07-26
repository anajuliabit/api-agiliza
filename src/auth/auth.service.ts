import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Token } from 'src/@types/token';
import { Scope } from 'src/enums/scope.enum';
import { Transaction } from 'src/payments/transaction';
import { permissions } from 'src/accounts/permissions';
const https = require('https');
const fs = require('fs');
const qs = require('querystring');

const as = 'https://as1.tecban-sandbox.o3bank.co.uk';
const rs = 'https://rs1.tecban-sandbox.o3bank.co.uk';

@Injectable()
export class AuthService {
  httpsAgent;
  instance: AxiosInstance;
  authorization: string;

  constructor() {
    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync(process.cwd() + '/config/client_certificate.crt'),
      key: fs.readFileSync(process.cwd() + '/config/client_private_key.key'),
      rejectUnauthorized: false,
    });
    this.instance = axios.create({
      httpsAgent: this.httpsAgent,
    });
    this.authorization = `Basic ${process.env.AUTH}`;
  }

  async getCredentialsAccessClient(
    scope: Scope,
    transaction?: Transaction,
  ): Promise<string> {
    const body = {
      grant_type: 'client_credentials',
      scope: `${scope} openid`,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: this.authorization,
    };

    const response = await this.instance
      .post(`${as}/token`, qs.stringify(body), { headers })
      .catch(error => {
        console.log(error);
        return error;
      });

    return this.createConsentiment(response.data, scope, transaction);
  }

  async getToken(code: string): Promise<Token> {
    const body = {
      grant_type: 'authorization_code',
      scope: 'accounts',
      code: code,
      redirect_uri: 'http://www.google.co.uk',
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: this.authorization,
    };

    const response = await this.instance
      .post(`${as}/token`, qs.stringify(body), {
        headers,
      })
      .catch(error => {
        console.log(error);
        return error;
      });
    return response.data;
  }

  private async createConsentiment(
    token: Token,
    scope: Scope,
    transaction?: Transaction,
  ): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      'x-fapi-financial-id': process.env.OB_PARTICIPANT_ID,
      'x-fapi-interaction-id': process.env.INTERACTION_ID,
      Authorization: `Bearer ${token.access_token}`,
    };

    if (scope === Scope.PAYMENTS) {
      headers['x-fapi-customer-ip-address'] = '10.1.1.10';
    }
    const bodyScopeAccounts = {
      Data: {
        Permissions: permissions,
      },
      Risk: {},
    };

    const bodyScopePayment = {
      Data: {
        Initiation: transaction,
      },
      Risk: {},
    };

    if (scope === Scope.PAYMENTS) {
      bodyScopePayment.Data.Initiation = transaction;
    }

    const response = await this.instance
      .post(
        `${rs}/open-banking/v3.1/${
          scope === Scope.PAYMENTS
            ? 'pisp/domestic-payment'
            : 'aisp/account-access'
        }-consents`,
        scope === Scope.PAYMENTS ? bodyScopePayment : bodyScopeAccounts,
        { headers },
      )
      .catch(error => {
        console.log(error);
        return error;
      });

    return this.getUrlRedirect(response.data.Data.ConsentId, scope);
  }

  private async getUrlRedirect(
    consentId: string,
    scope: Scope,
  ): Promise<string> {
    const headers = {
      Authorization: this.authorization,
    };
    const response = await this.instance.get(
      `${rs}/ozone/v1.0/auth-code-url/${consentId}?scope=${scope}&alg=none`,
      { headers },
    );

    return response.data;
  }
}
