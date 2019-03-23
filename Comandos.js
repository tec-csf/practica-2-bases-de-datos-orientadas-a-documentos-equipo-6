Comandos:

# Crear una red para el Sharding

sudo docker network create mongo-sh
# -----------------------------------------------
# ------ Configurar el Config Replica Set -------
# -----------------------------------------------

# Crear tres contenedores para los nodos del Config Replica Set

sudo docker run --name mongo-config1 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr
sudo docker run --name mongo-config2 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr
sudo docker run --name mongo-config3 -d --net mongo-sh mongo --replSet "rsConfig" --configsvr

# Iniciar una terminal en uno de los nodos

sudo docker exec -it mongo-config1 bash

# Conectarse a uno de los nodos 

mongo --host mongo-config1 --port 27019

# Inicializar el Config Replica Set

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

# Desconectarse del nodo

exit  # Para salir de mongo shell
exit  # Para salir del contenedor

# ------------------------------------------------
# ------ Configurar los Shard Replica Sets -------
# ------------------------------------------------

# Crear tres contenedores para los nodos del Shard Replica Set

sudo docker run --name mongo-shard11 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr
sudo docker run --name mongo-shard12 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr
sudo docker run --name mongo-shard13 -d --net mongo-sh mongo --replSet "rsShard1" --shardsvr

# Iniciar una terminal en uno de los nodos

sudo docker exec -it mongo-shard11 bash

# Conectarse a uno de los nodos 

mongo --host mongo-shard11 --port 27018

# Inicializar el Shard Replica Set

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

# Desconectarse del nodo

exit  # Para salir de mongo shell
exit  # Para salir del contenedor

# --------------------------------
# ------ Iniciar el Router -------
# --------------------------------

sudo docker run  --name mongo-router -d --net mongo-sh mongo  mongos --configdb rsConfig/mongo-config1:27019,mongo-config2:27019,mongo-config3:27019

# Conectarse al router

sudo docker exec -it mongo-router mongo

# Adicionar Shards al clúster

sh.addShard( "rsShard1/mongo-shard11:27018")
sh.addShard( "rsShard1/mongo-shard12:27018")
sh.addShard( "rsShard1/mongo-shard13:27018")

# Habilitar sharding para una base de datos

sh.enableSharding("practica")

# Habilitar sharding en una colección

db.createCollection("Country")
db.createCollection("Company")
db.createCollection("Person")

sh.shardCollection("practica.Country",  { "CountryID" : "hashed" } )
sh.shardCollection("practica.Company",  { "CompanyID" : "hashed" } )
sh.shardCollection("practica.Person",  { "PersonID" : "hashed" } )


#Para poder importar los datos es necesario primero pasarlos al contenedor. 

exit

#para copiarlos es necesario moverse a la carpeta donde se encuentran los archivos.


sudo docker cp company_data.json mongo-router:/company_data.json
sudo docker cp Person_data.json mongo-router:/Person_data.json
sudo docker cp Country_data.json mongo-router:/Country_data.json

#importar los datos a nuestro router:
#Primero conectarse al router nuevamente pero esta vez al sh:

sudo docker exec -it mongo-router sh

#importar

mongoimport -d practica -c Country --file /Country_dataset.json --jsonArray
mongoimport -d practica -c Person --file /Person_dataset.json --jsonArray
mongoimport -d practica -c Company --file /Company_dataset.json --jsonArray

#QUERIES:

#Mostrar todas las compañías que pertenezcan al dueño con ID 13 ordenadas según su número de empleados. 
db.Company.aggregate([{$match:{"OwnerID":13}},{$project:{"OwnerID":1, "Name":1, "No_Employees":1}}, {$sort:{"No_Employees":1}}]).pretty();

#La cantidad de personas menores a 40 años que tienen el mismo nombre. 
db.Person.aggregate([{$group:{"_id":{Name:"$Name"}, "Cantidad":{"$sum":1}}}, {$match:{"Age":{$lt:40}}}, {$project:{"PersonID":1, "Name":1,"Email":1,"Age":1}}])

#Mostrar todas las Countries con su id y región que tienen un id mayor a 25 y que tienen por nombre antigua y barbuda, marshal isslands o norway ordenado descendentemente
db.Country.aggregate([{$match:{"CountryID":{$gte:25}, "CountryName":{$in: ["Antigua and Barbuda", "Marshall Islands", "Norway"]}}, {$project:{"CountryID":1,"CountryName":1, "Region":1}}, {$sort: {"CountryID":-1}}}])