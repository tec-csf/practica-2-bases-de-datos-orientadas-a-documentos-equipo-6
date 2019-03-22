# TC3041-P2-Primavera-2019

Antony Adrian Morales

Alberto Pascal

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/wasabeef/awesome-android-ui)

Orientaciones para la **Práctica 2. Bases de datos orientadas a documentos**

# MongoDB
## Contribuir con la base de datos

### Configurar el Config Replica Set
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

### Configurar los Shard Replica Sets
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
### Iniciar el Router
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

### Importar datos al contenedor
1. Copiar archivos al contenedor: 
    - `sudo docker cp company_data.json mongo-router:/company_data.json`
    - `sudo docker cp Person_data.json mongo-router:/Person_data.json`
    - `sudo docker cp Country_data.json mongo-router:/Country_data.json`
2. Conectarse al contenedor: `sudo docker exec -it mongo-router sh`
3. Importar datos: 
    - `mongoimport -d practica -c Country --file /Country_data.json --jsonArray`
    - `mongoimport -d practica -c Person --file /Person_data.json --jsonArray`
    - `mongoimport -d practica -c Company --file /company_data.json --jsonArray`

# Aplicación
## Endpoints API

Ruta Desarrollo: http://127.0.0.1:3500/ 

### Revisar estado del api (GET) ![#c5f015](https://placehold.it/15/c5f015/000000?text=+)
    /health

##### Respuesta esperada
    {
    "status": 200,
    "name": "OK",
    "message": "i'm healthy",
    "customMessage": "API Practica 2 en funcionamiento"
    }

## Errores

### Manejo de Errores
Para manejar errores personalizados hay que crear el error y lanzar un next.

Todos los errores deben pasar por helper/error.helper.js.

#### Ejemplo
    let e = new Error('{mensaje customizado de tu error}');
    e.name = "{ErrorType}";
    return next(e);

#### ErrorType
Código de error  | ErrorType (e.name)
------------- | -------------
301  | movedPermanently
303  | seeOther
304  | notModified
307  | temporaryRedirect
308  | permanentRedirect
400  | badRequest
401  | unautorized
403  | forbidden
404  | notFound
405  | methodNotAllowed
409  | conflict
415  | unsupportedMediaType
418  | imATeapot
500  | internal
501  | notImplemented
502  | badGateway
503  | serviceUnavailable
504  | gatewayTimeout
507  | insufficientStorage

### Respuesta de errores
Los errores son retornados en JSON. Cada error tiene un **status**, **name**, **message** y **customMessage**.
El campo **message** es personalizado.

#### Ejemplo de un status 400
    {
      "status": 400,
      "name": 'badRequest',
      "message": 'Bad Request' + (err.message ? ': ' + err.message : ''),
      "customMessage": 'Solicitud Erronea'
    }

## Contribuir con el API

### Paquetes/Librerias recomendadas (Globales/Locales)
- Nodejs: `v8.11.3`
- Nodemon `v1.18.7` (Opcional para testing)

### Iniciar aplicación (Desarrollo)
- `npm install` Instalar paquetes de npm
- `npm start` Para iniciar con nodemon
- `npm test` Para iniciar con node
- `npm run dev` Para iniciar en modo desarrollo (muesta los logs)

### Pasos para correcto funcionamiento del API
1. Instalar paquetes/librerias Locales
2. Descargar el repositorio
3. Ingresar a la carpeta API
3. Instalar paquetes de npm
4. Es necesario contar con el archivo *.env*, este no se puede descargar via Github ya que contiene claves privadas (pedir al administrador del repositorio)
5. Correr el servidor

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