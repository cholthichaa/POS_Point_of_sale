"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zonesController_1 = require("../controllers/zonesController");
const router = express_1.default.Router();
router.get('/', zonesController_1.getZones);
router.get('/:id', zonesController_1.getZoneById);
router.post('/', zonesController_1.createZone);
router.patch('/:id', zonesController_1.patchUpdateZone);
router.delete('/:id', zonesController_1.deleteZone);
exports.default = router;
