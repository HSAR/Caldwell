/// <reference path="../../typings/index.d.ts" />

import * as url from "url";
import * as fetch from 'node-fetch';

import * as oauth2_auth from "./OAuth2";
import * as openid_auth from "./OpenID";

export enum IdentityProvider {
    AzureActiveDirectory, Steam
};

export class Authentication {

    public static requestUserAuthenticate(idp:IdentityProvider, windowParams):Promise<any> {
        switch (idp) {
            case IdentityProvider.AzureActiveDirectory:
                return oauth2_auth.authenticate(new oauth2_auth.ConfigList.AADConfig(), windowParams)
                    .then((token:any) => {
                        console.log("Token fetch complete.");
                        //console.log(JSON.stringify(token));

                        // use your token.access_token
                        /*if (token.expires_on > (Date.now() * 1000)) {// token.expires_on is in seconds from aadOauth
                            aadOauth.refreshToken(token.refresh_token)
                                .then((newToken:any) => {
                                    token = newToken;
                                });
                        }*/

                        // Fetch the user's information

                        var bearerToken:string = "Bearer " + token.access_token;
                        const header = {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': bearerToken
                        };

                        return fetch("https://graph.windows.net/me?api-version=1.6", {
                            method: 'GET',
                            headers: header,
                        })
                        .then(res => {
                            return res.json();
                        });
                    });
            case IdentityProvider.Steam:
                var steamConfig:openid_auth.ConfigList.SteamConfig = new openid_auth.ConfigList.SteamConfig()
                return openid_auth.authenticate(steamConfig, windowParams)
                    .then((openIdClaim) => {
                        var queryUrl:url.Url = url.parse("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/");
                        queryUrl.query = {
                            "key": steamConfig.APIKey,
                            "steamIds": openIdClaim['steam_id'],
                            "format": "json"
                        }

                        const header = {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        };
                        return fetch(url.format(queryUrl), {
                            method: 'GET',
                            headers: header,
                        })
                        .then(res => {
                            return res.json();
                        });
                    })
                    .then((queryJson:any) => {
                        let result = queryJson['response']['players'][0];
                        result.displayName = result['personaname'];
                        return result;
                    });
            default:
                return Promise.reject(new Error("Unsupported identity provider"));
        }
    }

}