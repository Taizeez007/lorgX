declare module 'paystack' {
  export interface PaystackTransaction {
    initialize(options: {
      amount: number;
      email: string;
      metadata?: any;
      currency?: string;
      reference?: string;
      callback_url?: string;
    }): Promise<{
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      }
    }>;
    
    verify(reference: string): Promise<{
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        metadata: any;
        customer: {
          email: string;
          metadata: any;
        }
      }
    }>;
  }
  
  export interface Paystack {
    transaction: PaystackTransaction;
  }
  
  function initialize(secretKey: string): Paystack;
  
  export default initialize;
}