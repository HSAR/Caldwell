/// <reference path="../../typings/index.d.ts" />

const electronOauth2 = require("electron-oauth2");

export interface IOAuth2Config {
    authorizationUrl:string;
    tokenUrl:string;
    clientId:string;
    clientSecret:string;
    useBasicAuthorizationHeader:boolean;
    redirectUri?:string; // defaults to "urn:ietf:wg:oauth:2.0:oob"
    additionalData?:Object;
    scope?:string;
}

export module ConfigList {
    abstract class DefaultOAuth2Config implements IOAuth2Config {
        public clientId:string;
        public clientSecret:string;
        public authorizationUrl:string;
        public tokenUrl:string;
        public useBasicAuthorizationHeader:boolean =  false;
        public redirectUri:string = "urn:ietf:wg:oauth:2.0:oob";
        public additionalData:Object = {}
    }

    export class AADConfig extends DefaultOAuth2Config {
        public clientId:string = 'cf7ead46-88fe-466c-9dfd-05f32029c8d7';
        public clientSecret:string = 'AfvKtlNe79AKDqMOGtiS79M2PpW9wPs3WwTVG6xO8Zo='; // if you are doing code or id_token code
        public authorizationUrl:string = "https://login.microsoftonline.com/aadstandard.onmicrosoft.com/oauth2/authorize";
        public tokenUrl:string = "https://login.microsoftonline.com/aadstandard.onmicrosoft.com/oauth2/token";
        public redirectUri:string = 'http://localhost';
        public additionalData:Object = { "resource": "389c72e2-d933-48d1-9af0-c4eb2139a2ac" }
    }

    export class GoogleConfig extends DefaultOAuth2Config {
        public clientId:string = '453439141140-4c02obqs7ohusvqsvjfc4ho4m17cnp4f.apps.googleusercontent.com';
        public clientSecret:string = 'T-cXWXD2LhgVs42G9DZMrmyl';
        public authorizationUrl:string = "https://accounts.google.com/o/oauth2/v2/auth";
        public tokenUrl:string = "https://www.googleapis.com/oauth2/v4/token";
        public redirectUri:string = 'http://localhost';
        public scope:string = "profile";
    }
}

export function authenticate(config:IOAuth2Config, windowParams):Promise<any> {
        var options = {
            scope: config.scope || 'user_impersonation',
            accessType: 'online',
            additionalTokenRequestData: config.additionalData
        };
        return electronOauth2(config, windowParams).getAccessToken(options);
}