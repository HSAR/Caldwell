/// <reference path="../../typings/index.d.ts" />

const electronOauth2 = require("electron-oauth2");

export interface IOAuth2Config {
    authorizationUrl:string;
    tokenUrl:string;
    clientId:string;
    clientSecret:string;
    useBasicAuthorizationHeader:boolean;
    redirectUri?:string;
}

export module ConfigList {
    export class AADConfig implements IOAuth2Config {
        public clientId:string = 'c639eb6b-f958-4922-8918-26854e23a930';
        public clientSecret:string = 'ot95kCjiiD3wh7jLNKPiBE1'; // if you are doing code or id_token code
        public authorizationUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/authorize";
        public tokenUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/token";
        public useBasicAuthorizationHeader:boolean =  false;
        public redirectUri:string = 'http://localhost';
    }
}

export function authenticate(config:IOAuth2Config, windowParams):Promise<any> {
        const options = {
            scope: 'user_impersonation',
            accessType: 'online'
        };
        return electronOauth2(config, windowParams).getAccessToken(options);
}