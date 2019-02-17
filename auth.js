const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.authenticate = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Obtem usuário por email
      const user = await User.findOne({ email });

      // Verifica senha
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (!isMatch) throw "Password did not match";
        resolve(user);
      });
    } catch (err) {
      // E-mail não encontrado ou senha não corresponde
      reject("Authentication Failed");
    }
  });
};
