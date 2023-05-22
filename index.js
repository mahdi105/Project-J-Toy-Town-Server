const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Enable CORS == Solve the proble 'Browser stop the fetch request or unable to fetch
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// MongoDB integration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p1nqiyb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //All Toys Collection 
    const toysCollection = client.db('toysDB').collection('toys');
    // Gallery Image Collection
    const gallerImgCollection = client.db('galleryDB').collection('gallery');

    // GET => API for reading toy document from MongoDB
    app.get('/toys', async (req, res) => {
      const category = req.query.category;
      const limit = parseInt(req.query.limit);
      const queryString = req.query.name;
      const email = req.query.email;
      if(queryString){
        const name = queryString.split(' ');
        const capitalized = name.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const capitalizedName = capitalized.join(' ');
        const query = { name: capitalizedName };
        const result = await toysCollection.find(query).toArray();
        res.send(result);
        return;
      }
      if (category) {
        const query = { category: category };
        const result = await toysCollection.find(query).toArray();
        res.send(result);
        return;
      }
      if (limit) {
        const result = await toysCollection.find().limit(limit).toArray();
        res.send(result)
        return
      }
      if(email){
        const query = {'seller.email': email}
        const result = await toysCollection.find(query).toArray();
        res.send(result);
        return;
      }

      const result = await toysCollection.find().toArray();
      res.send(result)
      return;
    })

    // GET => API for reading a single Toy document from MongoDB
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // GET => Read Gallery
    app.get('/gallery', async (req, res) => {
      const result = await gallerImgCollection.find().toArray();
      res.send(result)
    })

    // DELETE => Delete a toy Document from toysDB of MongoDb
    app.delete('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result)
    })
    
    // PATCH => Update some field of a specific document
    app.patch('/toy/:id', async(req, res) => {
      const updated = req.body;
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const newToy = {
        $set:{
          price: updated.price,
          quantity: updated.quantity,
          description: updated.description
        }
      }
      const result = await toysCollection.updateOne(filter, newToy);
      res.send(result);
    });



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Wellcome to Toy Town Express Server')
})

app.listen(port, () => {
  console.log(`The server is running on the port: ${port}`);
})