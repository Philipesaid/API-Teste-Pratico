const errors = require("restify-errors");
const rjwt = require("restify-jwt-community");
const Product = require("../models/Product");
const config = require("../config");

module.exports = server => {
  // Obtem produtos
  server.get("/products", async (req, res, next) => {
    try {
      const products = await Product.find({});
      res.send(products);
      next();
    } catch (err) {
      return next(new errors.InvalidContentError(err));
    }
  });

  // Obtem unico produto
  server.get("/products/:id", async (req, res, next) => {
    // Localiza e retorna o registro com o ID indicado
    try {
      const products = await Product.findById(req.params.id);
      res.send(products);
      next();
    } catch (err) {
      return next(
        new errors.ResourceNotFoundError(
          `There is no products with the id of ${req.params.id}`
        )
      );
    }
  });

  // Adiciona produto
  server.post(
    "/products",
    rjwt({ secret: config.JWT_SECRET }),
    async (req, res, next) => {
      // Verifica se há JSON
      if (!req.is("application/json")) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }

      const { name, price } = req.body;

      const product = new Product({
        name,
        price
      });

      try {
        const newProduct = await product.save();
        res.send(201);
        next();
      } catch (err) {
        return next(new errors.InternalError(err.message));
      }
    }
  );

  // Atualiza produto
  server.put(
    "/products/:id",
    rjwt({ secret: config.JWT_SECRET }),
    async (req, res, next) => {
      // Verifica se há JSON
      if (!req.is("application/json")) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }
      // Atualiza um único documento com base nos critérios
      try {
        const products = await Product.findOneAndUpdate(
          { _id: req.params.id },
          req.body
        );
        res.send(200);
        next();
      } catch (err) {
        return next(
          new errors.ResourceNotFoundError(
            `There is no product with the id of ${req.params.id}`
          )
        );
      }
    }
  );

  // Deleta produto
  server.del(
    "/products/:id",
    rjwt({ secret: config.JWT_SECRET }),
    async (req, res, next) => {
      // Exclui um único documento com base nos critérios
      try {
        const products = await Product.findOneAndRemove({
          _id: req.params.id
        });
        res.send(204);
        next();
      } catch (err) {
        return next(
          new errors.ResourceNotFoundError(
            `There is no product with the id of ${req.params.id}`
          )
        );
      }
    }
  );
};
