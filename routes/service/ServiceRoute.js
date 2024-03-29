const express = require("express");
const router = express.Router();
const controlleur = require("../../controlleurs/service/ServiceControlleur.js");
const { authJwt } = require("../../middlewares");

router.get("/list", controlleur.getService());
router.get("/limit", controlleur.getAllLimit());
router.get("/search/name", controlleur.searchByName());
router.get("/list/activated", controlleur.getServiceActif());
router.post(
  "/create",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.createService()
);

router
  .route("/service/:id")
  .get(controlleur.getServiceById())
  .put([authJwt.verifyToken, authJwt.isManager], controlleur.updateService())
  .delete(
    [authJwt.verifyToken, authJwt.isManager],
    controlleur.deleteService()
  );

module.exports = router;
