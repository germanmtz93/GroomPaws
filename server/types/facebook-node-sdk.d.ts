declare module 'facebook-node-sdk' {
  interface FacebookOptions {
    appId: string;
    appSecret: string;
    version?: string;
    accessToken?: string;
  }

  class FB {
    constructor(options: FacebookOptions);
    setAccessToken(token: string): void;
    getAccessToken(): string;
    api(path: string, method?: string, params?: any, callback?: (response: any) => void): void;
  }

  export = FB;
}