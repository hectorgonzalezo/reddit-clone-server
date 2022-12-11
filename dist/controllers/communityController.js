"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Community = require('../models/communityModel');
// List all communities in database
exports.communities_list = (req, res) => {
    res.send({ communities: "communities" });
};
// Display details about an individual community
// GET community
exports.community_detail = (req, res) => {
    res.send({ community: `Community ${req.params.id}` });
};
// create an individual community
// POST community
exports.community_create = (req, res) => {
    res.send({ community: `Community created` });
};
// Update an individual community
// PUT community
exports.community_update = (req, res) => {
    res.send({ community: `Community ${req.params.id} updated` });
};
// Display details about an individual community
// DELETE community
exports.community_delete = (req, res) => {
    res.send({ community: `Community ${req.params.id} deleted` });
};
//# sourceMappingURL=communityController.js.map