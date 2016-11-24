/// <reference path="../../typings/index.d.ts" />

import { app, BrowserWindow } from "electron";
import * as fetch from 'node-fetch';
const electronOauth2 = require("electron-oauth2");

import { Config } from "./config";

var config = {
    clientId: Config.clientID,
    clientSecret: Config.clientSecret,
    //authorizationUrl: Config.commonAuthEndpoint,
    authorizationUrl: "https://login.microsoftonline.com/aaddevtest.onmicrosoft.com/oauth2/authorize",
    tokenUrl: Config.tokenURL,
    useBasicAuthorizationHeader: false,
    //redirectUri: "urn:ietf:wg:oauth:2.0:oob"
    //redirectUri: Config.returnURL
    redirectUri: 'http://localhost'
};

console.log("Caldwell launch started.");

// Keep a global reference of the window object, 
// if you don't, the window will be closed automatically
// when the JavaScript object is garbage collected.
var mainWindow = null;
// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their
    // menu barto stay active until the user quits 
    // explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        //app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    console.log("Caldwell launch complete.");

    const windowParams = {
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        }
    };

    const options = {
        scope: 'user_impersonation',
        accessType: 'online'
    };

    const aadOauth = electronOauth2(config, windowParams);

    aadOauth.getAccessToken(options)
        .then((token:any) => {
            console.log("Token fetch complete.");
            //console.log(JSON.stringify(token));

            // use your token.access_token
            if (token.expires_on > (Date.now() * 1000)) {// token.expires_on is in seconds from aadOauth
                aadOauth.refreshToken(token.refresh_token)
                    .then((newToken:any) => {
                        token = newToken;
                    });
            }

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
                body: ''
            })
            /*.then(res => {
                return res.text();
            }).then(function(body) {
                console.log(body);
                return body;
            });*/
            .then(res => {
                return res.json();
            });
        })
        .then((userProfile:any) => {
            console.log("User profile fetch complete.");
            // set user profile as a global object
            console.log(JSON.stringify(userProfile));
            global['profile'] = userProfile;


            // Create the browser window.
            mainWindow = new BrowserWindow({width: 800, height: 600});

            // and load the index.html of the app.
            mainWindow.loadURL(`file://${__dirname}/index.html`);

            // Open the DevTools.
            // mainWindow.webContents.openDevTools();

            // Emitted when the window is closed.
            mainWindow.on('closed', function() {
                // Dereference the window object, usually you 
                // would store windows in an array if your 
                // app supports multi windows, this is the time
                // when you should delete the corresponding element.
                mainWindow = null;
                console.log("Caldwell closed.");
            });
        })
        .catch((error) => {
            console.log("Auth failed.");
            console.log(error);
            //mainWindow = null;
        });
});