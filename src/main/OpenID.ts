/// <reference path="../../typings/index.d.ts" />

import * as url from "url";
const BrowserWindow = require('electron').BrowserWindow;
const openid = require('openid');

export interface IOpenIDConfig {
    provider:string;
}

export module ConfigList {
    export class SteamConfig implements IOpenIDConfig {
        public provider:string = "http://steamcommunity.com/openid";
        public APIKey:string = "2B8CF1497CC5516983E3767B1F3BBC69";
        public clientId:string = 'c639eb6b-f958-4922-8918-26854e23a930';
        public clientSecret:string = 'ot95kCjiiD3wh7jLNKPiBE1'; // if you are doing code or id_token code
        public authorizationUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/authorize";
        public tokenUrl:string = "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/token";
        public useBasicAuthorizationHeader:boolean =  false;
        public redirectUri:string = 'http://localhost';
    }
}

export function authenticate(config:IOpenIDConfig, windowParams):Promise<any> {
    var rely = new openid.RelyingParty(
      'http://localhost:3000/verify-steam',
      'http://localhost:3000/', // Realm (specifies realm for OpenID authentication)
      true,  // Use stateless verification
      false, // Strict mode
      []     // List of extensions to enable and include
    );

    return new Promise(function (resolve, reject) {
        rely.authenticate(config.provider, false, function (error, providerUrl) {
            const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

            authWindow.loadURL(providerUrl);
            authWindow.show();

            authWindow.on('closed', () => {
                reject(new Error('window was closed by user'));
            });

            function onCallback(navUrl:string) {
                var query:any = url.parse(navUrl, true).query;

                if (query['openid.identity'] === undefined) {
                    reject(new Error('cannot authenticate through Steam'));
                    setImmediate(function () {
                        authWindow.close();
                    });
                } else {
                    resolve({
                        response_nonce: query['openid.response_nonce'],
                        assoc_handle: query['openid.assoc_handle'],
                        identity: query['openid.identity'],
                        steam_id: query['openid.identity'].match(/\/id\/(.*$)/)[1],
                        sig: query['openid.sig']
                    });
                    setImmediate(function () {
                        authWindow.close();
                    });
                }
            }

            authWindow.webContents.on('will-navigate', (event, url:string) => {
                onCallback(url);
            });

            authWindow.webContents.on('did-get-redirect-request', (event, oldUrl:string, newUrl:string) => {
                onCallback(newUrl);
            });
        });
    }); 
}

