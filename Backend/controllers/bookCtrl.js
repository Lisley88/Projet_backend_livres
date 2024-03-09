const Book = require("../models/Book");
const fs = require("fs"); //The File System module: Read files -module pour effectuer des opérations dans l'organisation des fichiers

//Récupérer tous les livres dans la base de donnée
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

// Récupérer un livre précis dans la BDD
exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id,
    })
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

// Récupérer les 3 livres les mieux notés dans la BDD
exports.getBestBooks = (req, res, next) => {
    Book.find()
        .sort({ rating: -1 })  //Trie par ordre décroissant de la note moyenne
        .limit(3)  //Limite le résultat aux 3 premiers livres
        .then((bestBooks) => {
            res.status(200).json(bestBooks);
        })
        .catch((error) => res.status(400).json({ error }));
};

// Ajouter un nouveau livre
exports.createBook = (req, res, next) => {
    //Récupération des données des livre de la requête
    const bookObject = JSON.parse(req.body.book);

    //La notation est obligatoire quand nous créons notre livre
    if (bookObject.ratings[0].grade === 0) {
        // On supprime l'image des fichiers locaux 
        fs.unlink(`images/${req.file.filename}`, (error) => {
            if (error) console.log(error);
        });
        res.status(401).json({ error });
    }

    //On supprime l'id et le userId envoyés par le front-end : on ne fait pas confiance au front-end
    delete bookObject._id;
    delete bookObject._userId;

    //Créé un nouvel objet Book avec les informations du formulaire par le front-end
    const book = new Book({
        ...bookObject, //Syntaxe spread pour inclure les proprietés de l'objet bookobject dans l'instance
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
        averageRating: bookObject.ratings[0].grade,
    });

    book.save() ////On enregistre ce nouveau livre dans la base de donnée
        .then(() => {
            res.status(201).json({ message: "Livre enregistré !" });
        })
        .catch((error) => {
            // Si il y a une erreur dans la requête, on supprime l'image
            fs.unlink(`images/${req.file.filename}`, (error) => {
                if (error) console.log(error);
            });
            res.status(401).json({ error });
        });
};

//Noter un livre
exports.rateBook = (req, res, next) => {
    const id = req.params.id;
    if (id == null || id == "undefined") {
        res.status(400).send("ID du livre est undefined");
        return;
    }
    //Vérifier la note doit être entre 0 et 5
    if (req.body.rating < 0 || req.body.rating > 5) {
        return res
            .status(400)
            .json({ message: "La note doit être entre 0 et 5" });
    }

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            //Vérifier si l'utilisateur a déjà noté le livre
            const bookrated = book.ratings.find(
                (rating) => rating.userId === req.auth.userId
            );

            if (!bookrated) {
                book.ratings.push({  //Ajouter la note
                    userId: req.auth.userId,
                    grade: req.body.rating,
                });

                const ratings = book.ratings.map((rating) => rating.grade);

                let averageRating =
                    ratings.reduce((previous, current) => {
                        return previous + current;
                    }, 0) / ratings.length;
                averageRating = averageRating.toFixed(1);//Conversion en float et arrondi à une décimale
                // On met à jour le livre dans la BDD
                Book.findByIdAndUpdate(
                    { _id: req.params.id },
                    { ratings: book.ratings, averageRating: averageRating },
                    { new: true }
                )
                    .then((book) => res.status(200).json(book))
                    .catch((error) => res.status(401).json({ error }));
            } else {
                return res.status(400).json({
                    message: "Vous ne pouvez notez qu'une seule fois",
                });
            }
        })
        .catch((error) => {
            return res.status(500).json({ error });
        });
};

//Modifier le livre
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              //Parse les données JSON de req.body.book
              ...JSON.parse(req.body.book),
              //Construction de l'URL de l'image
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body }; // si aucun fichier n'est présent dans la requête=>syntaxe de spread (...) pour créer une copie de toutes les propriétés de req.body

    //On supprime le userId envoyé par le front pour sécuriser l'app, et on utilisera
    //le userId retourné par notre middleware d'authentification qui se base sur le token
    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            //Vérifie que l'utilisateur est bien le propriétaire du livre
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Non autorization" });
            } else {
                let fileName = "";
                // Si une nouvelle image est envoyée, on supprime l'ancienne image des fichiers locaux
                if (req.file) {
                    fileName = book.imageUrl.split("/images/")[1];
                }
                //Mettre à jour le livre dans la BDD
                Book.updateOne(
                    { _id: req.params.id }, //Garantit que l'id du livre reste inchangé dans la Base de données
                    { ...bookObject, _id: req.params.id } //Argument qui specifie les nouvelles valeurs à mettre à jour
                )
                    .then(() => {
                        fs.unlink(`images/${fileName}`, (error) => {
                            if (error) console.log(error);
                        });
                        res.status(200).json({ message: "Livre modifié !" });
                    })
                    .catch((error) => {
                        //Si on a une erreur sur l'update, on supprime la nouvelle image.
                        fs.unlink(`images/${req.file.filename}`, (error) => {
                            if (error) console.log(error);
                        });
                        res.status(401).json({ error });
                    });
            }
        })
        .catch((error) => res.status(400).json({ error }));
};

//Supprimer un livre
exports.deleteBook = (req, res, next) => {
    //Rechercher le livre dans la BDD
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            //Vérifier que l'utilisateur est bien le propriétaire du livre
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Non autorization" }); //Si ce n'est pas le cas, on renvoie une erreur 401
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                // On supprime l'image des fichiers locaux et le livre de la BDD en fonction de son ID
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Livre supprimé !",
                            });
                        })
                        .catch(() =>
                            res
                                .status(401)
                                .json({ message: "La suppression à échoué !" })
                        );
                });
            }
        })
        .catch((error) => {
            // Si le livre n'est pas trouvé dans la BDD, on renvoie une erreur 500
            res.status(500).json({ error });
        });
};
