//The current application coordinates were pre-registered in a B2C tenant.  
// local    => baseSSOEndpoint http://localhost:9696/api/sso/, webapi => http://localhost:9696/azureb2c/api/Authenticated/success/
// preview  =>  baseSSOEndpoint https://api.blackpool.gov.uk/preview/sso/, webapi => https://api.blackpool.gov.uk/azureb2cpreview/api/Authenticated/success/
const apiConfig = {
    b2cScopes: ["https://asiftest3.onmicrosoft.com/1f968b7c-7184-4999-adb2-02e6be8b2c62/api-scope", "https://asiftest3.onmicrosoft.com/1f968b7c-7184-4999-adb2-02e6be8b2c62/access_as_user"],
    webApi: "https://api.blackpool.gov.uk/azureb2cpreview/api/Authenticated/success/",
    baseSSOEndpoint: "https://api.blackpool.gov.uk/preview/sso/",
     ssoEnum: {
        Account : { Library: 1, Council_Tax: 2, Uknown: 3 },
        UserType : { Exists: 1, Exists_Not_Active: 2, Not_Found: 3, Uknown: 4 }
    }
  };