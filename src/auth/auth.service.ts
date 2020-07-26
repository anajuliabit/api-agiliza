import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Token } from 'src/@types/token';
import {
  as,
  rs,
  obParticipantId,
  interactionId,
  auth,
} from '../config/environments';
import { Scope } from 'src/enums/scope.enum';
import { Transaction } from 'src/payments/transaction';
const https = require('https');
const fs = require('fs');
const qs = require('querystring');

@Injectable()
export class AuthService {
  httpsAgent;
  instance: AxiosInstance;

  constructor() {
    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync(
        process.cwd() + '/src/config/client_certificate.crt',
      ),
      key: fs.readFileSync(
        process.cwd() + '/src/config/client_private_key.key',
      ),
      rejectUnauthorized: false,
    });
    this.instance = axios.create({
      httpsAgent: this.httpsAgent,
    });
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
      Authorization: auth,
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
      Authorization: auth,
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
      'x-fapi-financial-id': obParticipantId,
      'x-fapi-interaction-id': interactionId,
      Authorization: `Bearer ${token.access_token}`,
    };

    if (scope === Scope.PAYMENTS) {
      headers['x-fapi-customer-ip-address'] = '10.1.1.10';
    }
    const bodyScopeAccounts = {
      Data: {
        Permissions: [
          'ReadAccountsBasic',
          'ReadAccountsDetail',
          'ReadBalances',
          'ReadBeneficiariesBasic',
          'ReadBeneficiariesDetail',
          'ReadDirectDebits',
          'ReadTransactionsBasic',
          'ReadTransactionsCredits',
          'ReadTransactionsDebits',
          'ReadTransactionsDetail',
          'ReadProducts',
          'ReadStandingOrdersDetail',
          'ReadProducts',
          'ReadStandingOrdersDetail',
          'ReadStatementsDetail',
          'ReadParty',
          'ReadOffers',
          'ReadScheduledPaymentsBasic',
          'ReadScheduledPaymentsDetail',
          'ReadPartyPSU',
        ],
      },
      Risk: {},
    };

    const bodyScopePayment = {
      Data: {
        Initiation: transaction,
      },
      Risk: {},
    };

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
      Authorization: auth,
    };
    const response = await this.instance.get(
      `${rs}/ozone/v1.0/auth-code-url/${consentId}?scope=${scope}&alg=none`,
      { headers },
    );

    return response.data;
  }
}
