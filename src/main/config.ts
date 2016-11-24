export module Config {
    // OAuth 2 stuff
    // Common auth endpoint
    export const commonAuthEndpoint:string = "https://login.microsoftonline.com/common";
    export const tokenURL = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/token";

    // Original AAD stuff
    export const identityMetadata:string = 'https://login.microsoftonline.com/common/.well-known/openid-configuration';
    export const returnURL:string = 'https://aad-dev-test.herokuapp.com/auth/openid/return/';
    export const clientID:string = 'c639eb6b-f958-4922-8918-26854e23a930';
    export const clientSecret:string = 'ot95kCjiiD3wh7jLNKPiBE1'; // if you are doing code or id_token code
    export const skipUserProfile:boolean = true; // for AzureAD should be set to true.
    export const responseType:string = 'id_token code'; // for login only flows use id_token. For accessing resources use `id_token code`
    export const responseMode:string = 'form_post';
    // Required if we use http for redirectUrl
    export const allowHttpForRedirectUrl:boolean = true;
    // Scopes info: https://docs.microsoft.com/en-gb/azure/active-directory/active-directory-v2-scopes
    export const scope:string = 'profile';
    // Required to set to false if you don't want to validate issuer
    export const validateIssuer:boolean = false;
    // Required if you want to provide the issuer(s) you want to validate instead of using the issuer from metadata
    export const issuer:string = null;
};
