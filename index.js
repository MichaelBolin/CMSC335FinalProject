
process.stdin.setEncoding("utf8");

const portNumber = 5000;


const path = require("path");
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */


app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })  

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

 /* Our database and collection */
 const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.7qphe0v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get("/", (request, response) => {
  response.render("index.ejs");
});

app.post("/addToDatabase", async (request, response) => {
  const variables = {
    font: request.body.font
  }
  try {
    await client.connect();
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(variables);
} catch (e) {
    console.error(e);
} finally {
    await client.close();
}
  response.render("index.ejs");
});

app.post("/clear", async (request, response) => {
  
    try {
      await client.connect();
      const result = await client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .deleteMany({});
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    } 
    response.render("index.ejs");
});

app.post("/display", async (request, response) => {
  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);
    const result = await cursor.toArray();
    let resultsString = ""
    result.forEach(x => resultsString += `<strong>${x.font}:</strong> <p style="font-family: '${x.font}', serif;">${request.body.message}</p><br>`)
    
    let importString ="<link rel=`stylesheet` href=`https://fonts.googleapis.com/css?family="
    result.forEach(x => importString += String(x.font).split(' ').join('+') + "|")
    let newString = importString.slice(0, -1) + "`>"
  const variables = {
    results: resultsString,
    linkTag: newString.split('`').join('"')
  }  
  response.render("display.ejs", variables)
} catch (e) {
    console.error(e);
} finally {
    await client.close();
}
});


app.get("/savedFonts", async (request, response) => {
  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);
    const result = await cursor.toArray();
    tableString = "<table border='1'><tr><th>Fonts</th></tr>"
    result.forEach(x => tableString += `<tr><td>${x.font}</td></tr>`)
    tableString += "</table>"
    const variables = {
      results: tableString
    }
    response.render("savedFonts.ejs", variables)
} catch (e) {
    console.error(e);
} finally {
    await client.close();
}
});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

