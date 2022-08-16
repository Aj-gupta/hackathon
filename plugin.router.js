import express from "express";
const router = express.Router();

import * as pluginController from "./plugin.controller.js";

router.get("/subtitle", pluginController.getSubtitle);

export default router;
