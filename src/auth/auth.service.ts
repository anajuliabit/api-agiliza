import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  async getCredentialsAcessClient() {
    console.log(require('path').join(__dirname));
    console.log(
      require('path').resolve(__dirname, '../config/client_certificate.crt'),
    );
    const httpsAgent = new (require('https').Agent({
      cert: require('fs').readFileSync(
        require('path').resolve(__dirname, '../config/client_certificate.crt'),
      ),
      key: require('fs').readFileSync(
        require('path').resolve(__dirname, '../config/client_private_key.key'),
      ),
      rejectUnauthorized: false,
    }))();

    const instance = axios.create({
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Basic ASDF',
      },
    });
    const response = await instance.post(
      'https://as1.tecban-sandbox.o3bank.co.uk/token',
      {
        grand_type: 'client_credentials',
        scope: 'accounts openid',
      },
    );
    console.log(response.data);
    return response.data;
  }
}
