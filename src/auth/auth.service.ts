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

  async getCredentialsAccessClient(): Promise<string> {
    const body = {
      grant_type: 'client_credentials',
      scope: 'accounts openid',
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

  async getToken(code: string) {
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

  private async createConsentiment(token: Token): Promise<string> {
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
    const response = await this.instance.post(
      `${rs}/open-banking/v3.1/aisp/account-access-consents`,
      body,
      { headers },
    );

    return this.getUrlRedirect(response.data.Data.ConsentId);
  }

  private async getUrlRedirect(consentId: string): Promise<string> {
    const headers = {
      Authorization: auth,
    };
    const response = await this.instance.get(
      `${rs}/ozone/v1.0/auth-code-url/${consentId}?scope=accounts&alg=none`,
      { headers },
    );

    return response.data;
  }
}
