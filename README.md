# TC3041-P2-Primavera-2019

Antony Adrian Morales

Alberto Pascal

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/wasabeef/awesome-android-ui)

Orientaciones para la **Práctica 2. Bases de datos orientadas a documentos**

# Contribuir con la base de datos (MongoDB)

## Configurar el Config Replica Set
1. Crear una red para el Sharding: `sudo docker network create mongo-sh`
2. Crear tres contenedores para los nodos del Config Replica Set:
    - `sudo docker run --name mongo-config1 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr`
    - `sudo docker run --name mongo-config2 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr`
    - `sudo docker run --name mongo-config3 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr`
3. Iniciar una terminal en uno de los nodos: `sudo docker exec -it mongo-config1 bash`
4. Conectarse a uno de los nodos: `mongo --host mongo-config1 --port 27019`
5. Inicializar el Config Replica Set: 
```json
    config = {
        "_id" : "rsConfig",
        "configsvr": true,
        "members" : [
            {
                "_id" : 0,
                "host" : "mongo-config1:27019"
            },
            {
                "_id" : 1,
                "host" : "mongo-config2:27019"
            },
            {
                "_id" : 2,
                "host" : "mongo-config3:27019"
            }
        ]
    }

    rs.initiate(config)
```
5. Desconectarse del nodo: `exit` `exit`

## Configurar los Shard Replica Sets
1. Crear tres contenedores para los nodos del Shard Replica Set:
    - `sudo docker run --name mongo-shard11 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr`
    - `sudo docker run --name mongo-shard12 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr`
    - `sudo docker run --name mongo-shard13 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr`
2. Iniciar una terminal en uno de los nodos: `sudo docker exec -it mongo-shard11 bash`
3. Conectarse a uno de los nodos: `mongo --host mongo-shard11 --port 27018`
4. Inicializar el Shard Replica Set:
```json
config = {
      "_id" : "rsShard1",
      "members" : [
          {
              "_id" : 0,
              "host" : "mongo-shard11:27018"
          },
          {
              "_id" : 1,
              "host" : "mongo-shard12:27018"
          },
          {
              "_id" : 2,
              "host" : "mongo-shard13:27018"
          }
      ]
  }

rs.initiate(config)
```
5. Desconectarse del nodo: `exit` `exit`

## Iniciar el Router
1. Iniciar router: `sudo docker run  --name mongo-router -d --net mongo-sh mongo  mongos --configdb rsConfig/mongo-config1:27019,mongo-config2:27019,mongo-config3:27019`
2. Conectarse al router: `sudo docker exec -it mongo-router mongo`
3. Adicionar Shards al clúster: 
    - `sh.addShard( "rsShard1/mongo-shard11:27018")`
    - `sh.addShard( "rsShard1/mongo-shard12:27018")`
    - `sh.addShard( "rsShard1/mongo-shard13:27018")`
4. Habilitar sharding para una base de datos: `sh.enableSharding("practica")`
5. Habilitar sharding en una colección: 
    - `db.createCollection("Country")`
    - `db.createCollection("Company")`
    - `db.createCollection("Person")`
    - `sh.shardCollection("practica.Country",  { "CountryID" : "hashed" } )`
    - `sh.shardCollection("practica.Company",  { "CompanyID" : "hashed" } )`
    - `sh.shardCollection("practica.Person",  { "PersonID" : "hashed" } )`

## Importar datos al contenedor
1. Copiar archivos al contenedor: 
    - `sudo docker cp company_data.json mongo-router:/company_data.json`
    - `sudo docker cp Person_data.json mongo-router:/Person_data.json`
    - `sudo docker cp Country_data.json mongo-router:/Country_data.json`
2. Conectarse al contenedor: `sudo docker exec -it mongo-router sh`
3. Importar datos: 
    - `mongoimport -d practica -c Country --file /Country_data.json --jsonArray`
    - `mongoimport -d practica -c Person --file /Person_data.json --jsonArray`
    - `mongoimport -d practica -c Company --file /company_data.json --jsonArray`

## Guía de estilos
### Mensajes en los Commits de Git

- Utilizar oraciones en presente ("Botón añadido" no "Se añadio botón")
- Comenzar el commit con mayúsculas
- Cuando solo se cambia documentacion añadir `[ci skip]` en el título del commit
- Considerar comenzar el commit con un emoji
    - :rocket: `:rocket:` cuando se lanza una nueva versión
    - :sparkles: `:sparkles:` cuando se añade nuevo código
    - :art: `:art:` mejora en el formato/estructura del código
    - :racehorse: `:racehorse:` mejora en el performance del código
    - :book: `:book:` cuando se escribe documentación
    - :bug: `:bug:` cuando se corrige un bug
    - :fire: `:fire:` cuando se eliminó código o archivos

## Notas

# Changelog
No hay cambios de ruptura

# Ayuda
antony999k@hotmail.com