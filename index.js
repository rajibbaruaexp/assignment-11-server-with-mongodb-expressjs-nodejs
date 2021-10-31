const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tmfpl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("tourPlans");
    const servicesCollection = database.collection("tours");
    const usersCollection = database.collection("usersData");

    //GET API
    app.get("/tours", async (req, res) => {
      const cursor = servicesCollection.find({});
      const tours = await cursor.toArray();

      res.send(tours);
    });
    //POST API for adding new service
    app.post("/tours", async (req, res) => {
      const newUser = req.body;

      const result = await servicesCollection.insertOne(newUser);
      res.json(result);
    });

    //POST API for booking checkout
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const result = await usersCollection.insertOne(newUser);
      res.json(result);
      // console.log(result);
    });

    //GET API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();

      res.send(users);
    });

    //DELETE API
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await usersCollection.deleteOne(query);

      res.json(result);
    });

    //UPDATE API to update status
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: updateData.status,
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      console.log(id);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel server is running on browser");
});
app.listen(port, () => {
  console.log("Running travel server on port", port);
});
