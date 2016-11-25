/// <reference path="../../typings/index.d.ts" />

const electronOauth2 = require("electron-oauth2");

export interface IOAuth2Config {
    authorizationUrl:string;
    tokenUrl:string;
    clientId:string;
    clientSecret:string;
    useBasicAuthorizationHeader:boolean;
    redirectUri?:string; // defaults to "urn:ietf:wg:oauth:2.0:oob"
    additionalData?:Object
}

export module ConfigList {
    export class AADConfig implements IOAuth2Config {
        public clientId:string = 'c639eb6b-f958-4922-8918-26854e23a930';
        public clientSecret:string = 'ot95kCjiiD3wh7jLNKPiBE1'; // if you are doing code or id_token code
        public authorizationUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/authorize";
        public tokenUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/token";
        public useBasicAuthorizationHeader:boolean =  false;
        public redirectUri:string = 'http://localhost';
        public additionalData:Object = { "resource": "https://graph.windows.net" }
    }

    export class GoogleConfig implements IOAuth2Config {
        public clientId:string = '453439141140-4c02obqs7ohusvqsvjfc4ho4m17cnp4f.apps.googleusercontent.com';
        public clientSecret:string = 'T-cXWXD2LhgVs42G9DZMrmyl';
        public authorizationUrl:string = "https://accounts.google.com/o/oauth2/v2/auth";
        public tokenUrl:string = "https://www.googleapis.com/oauth2/v4/token";
        public useBasicAuthorizationHeader:boolean =  false;
        public redirectUri:string = 'http://localhost';
    }
}

export function authenticate(config:IOAuth2Config, windowParams, scope?:string):Promise<any> {
        var options = {
            scope: scope || 'user_impersonation',
            accessType: 'online',
            additionalTokenRequestData: config.additionalData
        };
        return electronOauth2(config, windowParams).getAccessToken(options);
}