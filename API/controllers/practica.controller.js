//controllers/practica.controller.js
'use strict';
let Person = require('../models/Person');
let Company = require('../models/Company');
let Country = require('../models/Country');

//3 Queries Aggregation Framework. Cada consulta debe incluye un mínimo de tres etapas en el pipeline.

//Mostrar todas las compañías que pertenezcan al dueño con ID 13 ordenadas según su número de empleados. 
exports.company13 = (req, res, next) => {
  Company.aggregate([
    {$match:{"OwnerID":13}},{$project:{"OwnerID":1, "Name":1, "No_Employees":1}}, {$sort:{"No_Employees":1}}
  ], (err, usuario) => {
    if (err) {
      let e = new Error(err);
      e.name = "internal";
      return next(e);
    }
    if (!usuario) {
      let e = new Error('Compañia no encontrado');
      e.name = "notFound";
      return next(e);
    }
    res.status(200).json(usuario)
  });
}


//La cantidad de personas menores a 40 años que tienen el mismo nombre. 
exports.menor40 = (req, res, next) => {
  Person.aggregate([
    {$group:{"_id":{Name:"$Name"}, "Cantidad":{"$sum":1}}}, {$match:{"Age":{$lt:40}}}, {$project:{"PersonID":1, "Name":1,"Email":1,"Age":1}}
  ], (err, usuario) => {
    if (err) {
      let e = new Error(err);
      e.name = "internal";
      return next(e);
    }
    if (!usuario) {
      let e = new Error('Compañia no encontrado');
      e.name = "notFound";
      return next(e);
    }
    res.status(200).json(usuario)
  });
}

//Mostrar todas las Countries con su id y región que tienen un id mayor a 25 y que tienen por nombre antigua y barbuda, marshal isslands o norway ordenado descendentemente
exports.countries = (req, res, next) => {
  Country.aggregate([
    {$match:{"CountryID":{$gte:25}, "CountryName":{$in: ["Antigua and Barbuda", "Marshall Islands", "Norway"]}}},
    {$project:{"CountryID":1,"CountryName":1, "Region":1}},
    {$sort: {"CountryID":-1}}
  ], (err, usuario) => {
    if (err) {
      let e = new Error(err);
      e.name = "internal";
      return next(e);
    }
    if (!usuario) {
      let e = new Error('Compañia no encontrado');
      e.name = "notFound";
      return next(e);
    }
    res.status(200).json(usuario)
  });
}