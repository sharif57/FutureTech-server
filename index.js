const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors())
app.use(express.json())

// FutureTech
// l8wnTBoCIw8m9ldd


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwjeixv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        // collection related
        const reviewCollection = client.db('FutureTech').collection('reviews')
        const postCollection = client.db('FutureTech').collection('post')



        app.get(('/reviews'), async (req, res) => {
            const cursor = reviewCollection.find()
            const result = await cursor.toArray()
            res.send(result)
            console.log(result);
        })

        // post related api
        app.post(('/post'), async (req, res) => {
            const newUsers = req.body;
            // console.log(newUsers);
            const result = await postCollection.insertOne(newUsers)
            res.send(result)
        })

        app.get('/post', async (req, res) => {
            const cursor = postCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/post/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await postCollection.findOne(query)
            res.send(result)
        })

        app.get('/posts/:email', async (req, res) => {
            console.log(req.params.email);
            const email = req.params.email;
            const query = { email: email }
            const result = await postCollection.find(query).toArray();
            res.send(result)
            console.log(result);
        })

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await postCollection.deleteOne(query)
            res.send(result)
            console.log(result);
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
    res.send('futureTech server is running')
})

app.listen(port, () => {
    console.log(`futureTech server is running on port ${port}`)
})