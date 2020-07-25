import { Injectable } from '@nestjs/common';
import axios from 'axios';
const https = require('https');
const fs = require('fs');
const qs = require('querystring');

@Injectable()
export class AuthService {
  async getCredentialsAcessClient() {
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(process.cwd() + '/config/client_certificate.crt'),
      key: fs.readFileSync(process.cwd() + '/config/client_private_key.key'),
      rejectUnauthorized: false,
    });

    const body = {
      grant_type: 'client_credentials',
      scope: 'accounts openid',
    };

    const instance = axios.create({
      httpsAgent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization:
          'Basic MzM0ZGExNjUtNzc5OS00ZTZiLTgxYmEtNmU0NjMxYzJmM2Y5OjIyOTM4NDRlLTcxZDgtNDBjYS1iZGRhLTEyYjA4YzUzMGJhNw==',
      },
    });
    const response = await instance.post(
      'https://as1.tecban-sandbox.o3bank.co.uk/token',
      qs.stringify(body),
    );

    if (response.status !== 200) {
      // @TODO Handle error
      console.log(response);
    }
    return response.data;
  }
}
