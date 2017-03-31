/// <reference path="../../typings/index.d.ts" />

import { app, BrowserWindow } from "electron";

import { Authentication, IdentityProvider, AuthenticatedUser } from "./Authentication";

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

    Authentication.requestUserAuthenticate(IdentityProvider.Google, windowParams)
        .then((userProfile:AuthenticatedUser) => {
            // set user profile as a global object
            console.log("User profile fetch complete.")
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