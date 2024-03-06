const Book = require("../models/Book");
const fs = require("fs"); //The File System module: Read files

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

exports.getBestBooks = (req, res, next) => {
    Book.find()
        .sort({ rating: -1 })
        .limit(3)
        .then((bestBooks) => {
            res.status(200).json(bestBooks);
        })
        .catch((error) => res.status(400).json({ error }));
};

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    if (bookObject.ratings[0].grade === 0) {
        return res.status(400).json({ message: "La notation est obligatoire" });
    }

    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
    });
    book.save()
        .then(() => {
            res.status(201).json({ message: "Livre enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.rateBook = (req, res, next) => {
    //Vérifier la note entre 0 et 5
    if (req.body.rating < 0 || req.body.rating > 5) {
        return res
            .status(400)
            .json({ message: "La note doit être entre 0 et 5" });
    }

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            const bookrated = book.ratings.find(
                (rating) => rating.userId === req.auth.userId
            );

            if (!bookrated) {
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating,
                });

                const ratings = book.ratings.map((rating) => rating.grade);

                let averageRating =
                    ratings.reduce((previous, current) => {
                        return previous + current;
                    }, 0) / ratings.length;
                averageRating = averageRating.toFixed(1);

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

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id }).then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: "Non autorization" });
        } else {
            let fileName = "";
            if (req.file) {
                fileName = book.imageUrl.split("/images/")[1];
            }
            Book.updateOne(
                { _id: req.params.id },
                { ...bookObject, _id: req.params.id }
            )
                .then(() => {
                    fs.unlink(`images/${fileName}`, (error) => {
                        if (error) console.log(err);
                    });
                    res.status(200).json({ message: "Objet modifié !" });
                })
                .catch((error) => {
                    // Si on a une erreur sur l'update, on supprime la nouvelle image.
                    fs.unlink(`images/${req.file.filename}`, (error) => {
                        if (error) console.log(err);
                    });
                    res.status(401).json({ error });
                });
        }
    });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Non autorization" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !",
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};
