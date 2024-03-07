const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp-config");

// Importer les livres du contrôleur
const bookCtrl = require("../controllers/bookCtrl");

// Définition des chemins associés aux livres dans l'application
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBooks);
router.get("/:id", bookCtrl.getOneBook);
router.post("/", auth, multer, sharp, bookCtrl.createBook);
router.put("/:id", auth, multer, sharp, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
