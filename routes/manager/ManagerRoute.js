const express = require("express");
const router = express.Router();
const controlleur = require("../../controlleurs/manager/ManagerControlleur.js");
const { authJwt } = require("../../middlewares");

router.get(
  "/list",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.getManager()
);
router.post(
  "/login",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.loginManager()
);
router.post(
  "/create",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.createManager()
);

router.get(
  "/statistique/employe",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.getTempsMoyenTravailPourChaqueEmpoye()
);
router.get(
  "/statistique/reservation-jour",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.getNbrRdv_jour()
);
router.get(
  "/statistique/reservation-mois",
  [authJwt.verifyToken, authJwt.isManager],
  controlleur.getNbrRdv_mois()
);

router
  .route("/manager/:id")
  .get([authJwt.verifyToken, authJwt.isManager], controlleur.getManagerById())
  .put([authJwt.verifyToken, authJwt.isManager], controlleur.updateManager())
  .delete(
    [authJwt.verifyToken, authJwt.isManager],
    controlleur.deleteManager()
  );

module.exports = router;
