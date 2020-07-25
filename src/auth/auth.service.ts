import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Token } from 'src/@types/token';
import {
  scope,
  as,
  rs,
  obParticipantId,
  interactionId,
  intentId,
  auth,
} from '../config/environments';
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

  async getCredentialsAccessClient() {
    const body = {
      grant_type: 'client_credentials',
      scope,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: auth,
    };

    const response = await this.instance.post(
      `${as}/token`,
      qs.stringify(body),
      { headers },
    );

    if (response.status !== 200) {
      // @TODO Handle error
      console.log(response);
    }
    return this.createConsentiment(response.data);
  }

  async createConsentiment(token: Token) {
    const headers = {
      'Content-Type': 'application/json',
      'x-fapi-financial-id': obParticipantId,
      'x-fapi-interaction-id': interactionId,
      Authorization: `Bearer ${token.access_token}`,
    };

    const body = {
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
    await this.instance.post(
      `${rs}/open-banking/v3.1/aisp/account-access-consents`,
      body,
      { headers },
    );

    return this.getUrlRedirect();
  }

  async getUrlRedirect() {
    const headers = {
      Authorization: auth,
    };
    const response = await this.instance.get(
      `${rs}/ozone/v1.0/auth-code-url/${intentId}?scope=accounts&alg=none`,
      { headers },
    );

    return response.data;
  }
}
