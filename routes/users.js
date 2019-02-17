const errors = require("restify-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../auth");
const config = require("../config");
const rjwt = require("restify-jwt-community");

module.exports = server => {
  // Adiciona usuario
  server.post("/register", (req, res, next) => {
    const { name, email, telefone, password, produtos } = req.body;

    const user = new User({
      name,
      email,
      telefone,
      password,
      produtos
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, async (err, hash) => {
        // Hash Password
        user.password = hash;
        // Salva usuario
        try {
          const newUser = await user.save();
          res.send(201);
          next();
        } catch (err) {
          return next(new errors.InternalError(err.message));
        }
      });
    });
  });

  // Obtem usuarios
  server.get("/user", async (req, res, next) => {
    try {
      const user = await User.find({});
      res.send(user);
      next();
    } catch (err) {
      return next(new errors.InvalidContentError(err));
    }
  });

  // Obtem unico usuario
  server.get("/user/:id", async (req, res, next) => {
    // Localiza e retorna o registro com o ID indicado
    try {
      const user = await User.findById(req.params.id);
      res.send(user);
      next();
    } catch (err) {
      return next(
        new errors.ResourceNotFoundError(
          `There is no product with the id of ${req.params.id}`
        )
      );
    }
  });

  // Atualiza usuario
  server.put(
    "/user/:id",
    rjwt({ secret: config.JWT_SECRET }),
    async (req, res, next) => {
      // Verifica se ha JSON
      if (!req.is("application/json")) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }
      // Atualiza um único documento com base nos critérios
      try {
        const user = await User.findOneAndUpdate(
          { _id: req.params.id },
          req.body
        );
        res.send(200);
        next();
      } catch (err) {
        return next(
          new errors.ResourceNotFoundError(
            `There is no user with the id of ${req.params.id}`
          )
        );
      }
    }
  );

  // Deleta usuario
  server.del(
    "/user/:id",
    rjwt({ secret: config.JWT_SECRET }),
    async (req, res, next) => {
      // Exclui um único documento com base nos critérios
      try {
        const user = await User.findOneAndRemove({
          _id: req.params.id
        });
        res.send(204);
        next();
      } catch (err) {
        return next(
          new errors.ResourceNotFoundError(
            `There is no user with the id of ${req.params.id}`
          )
        );
      }
    }
  );

  // Autentica usuário
  server.post("/auth", async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // Autentica usuario
      const user = await auth.authenticate(email, password);

      // Cria JWT
      const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
        expiresIn: "60m"
      });

      const { iat, exp } = jwt.decode(token);
      // Responde com token
      res.send({ iat, exp, token });

      next();
    } catch (err) {
      // Usuario não autorizado
      return next(new errors.UnauthorizedError(err));
    }
  });
};
