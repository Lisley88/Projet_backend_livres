const express = require('express')

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sasa:MonVieuxGrimoire@atlascluster.izzodwm.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post('/api/books', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message:'objet créé!'
  });
});

app.get('/api/books', (req, res, next)=>{
  const books = [
    {userId : String,
    title : String ,
    author : String ,
    imageUrl : String ,
    year: Number ,
    genre: String ,
    ratings : [
    {
    userId : String ,
    grade : Number ,
    }
    ] ,
    averageRating : Number ,
  },
  ];
  res.status(200).json(books);
});

module.exports = app;