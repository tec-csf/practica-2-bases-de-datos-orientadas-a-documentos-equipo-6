//controllers/practica.controller.js
'use strict';
let Person = require('../models/Person');

//3 Queries Aggregation Framework. Cada consulta debe incluye un mínimo de tres etapas en el pipeline.

exports.quierie1 = (req, res, next) => {
  Person.findOne({
  }, (err, usuario) => {
    if (err) {
      let e = new Error(err);
      e.name = "internal";
      return next(e);
    }
    if (!usuario) {
      let e = new Error('Usuario no encontrado');
      e.name = "notFound";
      return next(e);
    }
    res.status(200).json(usuario)
  });
}