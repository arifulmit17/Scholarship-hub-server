require('dotenv').config();
const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const applicationCollection=db.collection('applications')
    const reviewCollection=db.collection('reviews')
    const usersCollection=db.collection('users')

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // jwt related api
        app.post('/jwt', (req, res) => {
            const user = { email: req.body.email }
            console.log(user);
            const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
                expiresIn: "14d"
            })
            res.send({ token, message: "jwt token created successfully" })

        })
    // user related api
    app.post('/user',async(req,res)=>{
        const userdata=req.body
        userdata.role="user"
        userdata.created_at=new Date().toISOString()
        userdata.last_loggedIn=new Date().toISOString()
        const query={email:userdata?.email}
        const alreadyExists=await usersCollection.findOne(query)
        if(!!alreadyExists){
          const result=await usersCollection.updateOne(query,{$set:{last_loggedIn: new Date().toISOString()}})
          return res.send(result)
        }
        const result=await usersCollection.insertOne(userdata)
        res.send(result)
    })
    // get all users data
    app.get('/user', async (req, res) => {
      
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    // get a user's role
    app.get('/user/role/:email', async (req, res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({ email })
      if (!result) return res.status(404).send({ message: 'User Not Found.' })
      res.send({ role: result?.role })
    })
    // get a user's id
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({ email })
      if (!result) return res.status(404).send({ message: 'User Not Found.' })
      res.send(result)
    })

    // update  user's role
    app.patch(
      '/user/role/update/:email',
      async (req, res) => {
        const email = req.params.email
        const { role } = req.body
        console.log(role)
        const filter = { email: email }
        const updateDoc = {
          $set: {
            role,
          },
        }
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.send(result)
      }
    )
    // delete user api
    app.delete('/deleteuser/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })

    // scholarchip related api
    app.get('/scholarship',async(req,res)=>{
        
        const result=await scholarshipCollection.find().toArray()
        res.send(result)
    })
    

    app.get('/scholarship/:id', async (req, res) => {
          

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await scholarshipCollection.findOne(query);
            res.send(result);
        })

    app.post('/add-scholarship',async (req, res)=>{
      const scholarship =req.body
      const result=await scholarshipCollection.insertOne(scholarship)
      res.send(result)
    })
    // update scholarship api
    app.put(
      '/scholarshipupdate/:id',
      async (req, res) => {
        const id = req.params.id;
        const options = { upsert: true };
        const updatedscholarship = req.body;
        delete updatedscholarship._id;
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set:updatedscholarship,
        }
        const result = await scholarshipCollection.updateOne(filter, updateDoc,options)
        console.log(result)
        res.send(result)
      }
    )
    // delete scholarship api
    app.delete('/deletescholarship/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await scholarshipCollection.deleteOne(query);
      res.send(result)
    })
    // Review related api
    app.post('/add-review',async (req, res)=>{
      const review =req.body
      const result=await reviewCollection.insertOne(review)
      res.send(result)
    })
    // get review api
    app.get('/review/:email',async(req,res)=>{
      const token = req?.headers?.authorization?.split(' ')[1]
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                    if (err) {
                        console.log(err);
                    }
            
                    req.decodedemail = decoded.email
                })
            }
            const userEmail = req.params.email
      
            if (userEmail !== req.decodedemail) {
                return res.status(403).send({ message: 'you are not authorized' });
            }
      const result = await reviewCollection.find({ userEmail }).toArray()
      res.send(result)
    })
    // get review based on scholarship
    app.get('/reviews/:id',async(req,res)=>{
      const scholarshipId = req.params.id
      const result = await reviewCollection.find({ scholarshipId }).toArray()
      res.send(result)
    })
    // get all review api
    app.get('/review',async(req,res)=>{
      const result = await reviewCollection.find().toArray()
      res.send(result)
    })
    // update review api
    app.put(
      '/reviewupdate/:id',
      async (req, res) => {
        const id = req.params.id;
        const options = { upsert: true };
        const updatedrev = req.body;
        delete updatedrev._id;
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set:updatedrev,
        }
        const result = await reviewCollection.updateOne(filter, updateDoc,options)
        console.log(result)
        res.send(result)
      }
    )
    // delete review api
    app.delete('/deletereview/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewCollection.deleteOne(query);
      res.send(result)
    })
    // Application related api
    app.post('/add-application',async (req, res)=>{
      const application =req.body
      const result=await applicationCollection.insertOne(application)
      res.send(result)
    })
    // get application data based on user email
    app.get('/application/:email',async (req, res)=>{
      const token = req?.headers?.authorization?.split(' ')[1]
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(decoded)
                    req.decodedemail = decoded.email
                })
            }
      const userEmail = req.params.email
      if (userEmail !== req.decodedemail) {
                return res.status(403).send({ message: 'you are not authorized' });
            }
      const result = await applicationCollection.find({ userEmail }).toArray()
      res.send(result)
    })
    // get all applications
    app.get('/applications/',async (req, res)=>{
      const result = await applicationCollection.find().toArray()
      res.send(result)
    })
    // update aplication status
    app.patch(
      '/application/status/update/:id',
      async (req, res) => {
        const id = req.params.id
        const { status } = req.body
        console.log(status)
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set: {
            applicationStatus:status,
          },
        }
        const result = await applicationCollection.updateOne(filter, updateDoc)
        console.log(result)
        res.send(result)
      }
    )
    // update application
    app.put(
      '/application/update/:id',
      async (req, res) => {
        const id = req.params.id;
        const options = { upsert: true };
        const updatedapp = req.body;
        delete updatedapp._id;
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set:updatedapp,
        }
        const result = await applicationCollection.updateOne(filter, updateDoc,options)
        console.log(result)
        res.send(result)
      }
    )
    // add application feedback
    app.patch(
      '/application/feedback/update/:id',
      async (req, res) => {
        const id = req.params.id
        const { feedback } = req.body
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set: {
            feedback:feedback,
          },
        }
        const result = await applicationCollection.updateOne(filter, updateDoc)
        console.log(result)
        res.send(result)
      }
    )
    // delete application api
    app.delete('/deleteapplication/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await applicationCollection.deleteOne(query);
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