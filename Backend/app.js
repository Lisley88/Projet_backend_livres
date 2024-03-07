require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
//// Import de nos routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

// Connexion à la base de donnée avec nos identifiants
mongoose
    .connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// Nous permet de lire de lire les données que l'on va récupérer en les
// "transformant" en objets javascript
app.use(express.json());

//Gestion des CORS
app.use((req, res, next) => {
    //accéder à notre API depuis n'importe quelle origine ( '*' )
    res.setHeader("Access-Control-Allow-Origin", "*");
    //ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    //envoyer des requêtes avec les méthodes ( GET ,POST...).
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

// Nous permet de servir les images dans l'app
app.use("/images", express.static(path.join(__dirname, "images")));
// Appel de nos routes
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
