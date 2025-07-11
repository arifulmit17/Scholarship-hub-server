require('dotenv').config();
const express = require('express')
const cors = require('cors');
//const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json());

// DB_USER=Scholar
// DB_PASS=CGVpT6O8ypuwbvEd



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52sdtnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    const db=client.db('scholarshipdb')
    const scholarshipCollection=db.collection('scholarships')
    const usersCollection=db.collection('users')

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // user related api
    app.post('/user',async(req,res)=>{
        const userdata=req.body
        userdata.role="user"
        userdata.created_at=Date.now()
        userdata.last_loggedIn=Date.now()
        const result=await usersCollection.insertOne(userdata)
        res.send(result)
    })

    // scholarchip related api
    app.get('/scholarship',async(req,res)=>{
        
        const result=await scholarshipCollection.find().toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is being used for scholarship!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})