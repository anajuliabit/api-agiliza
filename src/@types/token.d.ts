export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  state?: string;
  refresh_token?: string;
  id_token?: string;
}
