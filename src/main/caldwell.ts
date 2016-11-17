/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Engine } from "excalibur";

var game = new Engine({
    width: 400,
    height: 300
});
// todo build awesome game here

// Start the engine to begin the game.
game.start();

