//Importer mongoose
const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');
//Créer notre Schéma en utilisant la fonction Schema() de Mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, //la valeur <unique: true> pour que chaque email chaque utilisateur
  password: { type: String, required: true }
});
//<unique:true>+uniqueValidator -->plug-in, s'assurera que deux utilisateurs ne puissent partager la même adresse e-mail.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);