export class Transaction {
  InstructionIdentification: string;
  EndToEndIdentification: string;
  InstructedAmount: {
    Amount: string;
    Currency: string;
  };
  CreditorAccount: {
    SchemeName: string;
    Identification: string;
    Name: string;
  };
}
