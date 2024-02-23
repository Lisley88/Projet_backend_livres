const Book = require('../models/Book');
const fs = require('fs'); //The File System module: Read files

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then((books) => {
        res.status(200).json(books);
      })
    .catch(
      (error) => {
        res.status(400).json({
          error: error,
        });
      }
    );
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    })
    .then(
      (book) => {
        res.status(200).json(book);
      }
    )
    .catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
};

exports.getBestBooks = (req, res, next) => {
  Book.find().sort({ rating: -1 }).limit(3)
    .then(bestBooks => { res.status(200).json(bestBooks);})  
    .catch(error => res.status(400).json({ error }));
}

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    book.save()
        .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
        .catch((error) => { res.status(400).json( { error })})
};

exports.rateBook = (req, res, next) => {
    const newRate = req.body;

    Book.findOne({ _id: req.params.id})
    .then(book =>{
      if (ratings.some((rating) => rating.userId === newRate.userId)) {
        return res
          .status(400)
          .json({ message: "vous ne pouvez notez qu'une seule fois" })
      }

      const newRating = { userId: newRate.userId, grade: newRate.rating }
      ratings.push(newRating)

      const sum = ratings.reduce((accumulator, rating) => {
        return accumulator + rating.grade
      }, 0)


      let averageRating = sum / ratings.length
      book.averageRating = averageRating.toFixed(1)

      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => {
          res.status(400).json({ error })
        })
    })
    .catch((error) => {
      res.status(400).json({
        error,
      })
    })
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

 