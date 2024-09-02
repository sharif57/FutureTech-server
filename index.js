const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken')
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
        const resourceCollection = client.db('FutureTech').collection('resource')
        const bookMarkCollection = client.db('FutureTech').collection('bookMark')
        const newsCollection = client.db('FutureTech').collection('news')
        const userCollection = client.db('FutureTech').collection('users')



        //jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
            res.send({ token })
        })

        // middleware
        // const verifyToken = (req, res, next) => {
        //     console.log('inside verify token', req.headers.authorization);
        //     if (!req.headers.authorization) {
        //         return res.status(401).send({ message: 'forbidden access' })
        //     }
        //     const token = req.headers.authorization.split(' ')[1]
        //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //         console.log(decoded);
        //         if (err) {
        //             return res.status(401).send({ message: 'forbidden access' })
        //         }
        //         req.decoded = decoded;
        //         next()
        //     })

        // }

        const verifyToken = (req, res, next) => {
            console.log('Inside verifyToken middleware');
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).send({ message: 'Forbidden access: No token provided' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).send({ message: 'Forbidden access: Malformed token' });
            }

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Forbidden access: Invalid token' });
                }

                console.log('Decoded token:', decoded);
                req.decoded = decoded;
                next();
            });
        };

        //users related api

        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists', insertId: null })
            }

            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.get(('/users'), async (req, res) => {
            console.log(req.headers);
            const cursor = userCollection.find();
            const result = await cursor.toArray()
            res.send(result)
            console.log(result);
        })

        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'unauthorized access' })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query)
            let admin = false;
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })

        app.delete('/userDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
            console.log(result);
        })


        //reviews api
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


        // resources related api

        app.get(('/resource'), async (req, res) => {
            const cursor = resourceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
            console.log(result);
        })

        //bookMark related api

        app.post('/bookMark', async (req, res) => {
            const newUsers = req.body;
            // console.log(newUsers);
            const result = await bookMarkCollection.insertOne(newUsers)
            res.send(result)
        })

        app.get('/bookMark', async (req, res) => {
            const cursor = bookMarkCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })


        app.get('/bookMark/:email', async (req, res) => {
            console.log(req.params.email);
            const email = req.params.email;
            const query = { email: email }
            const result = await bookMarkCollection.find(query).toArray();
            res.send(result)
            console.log(result);
        })

        app.get('/bookMarks/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookMarkCollection.findOne(query)
            res.send(result)
        })

        app.delete('/deleteBook/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookMarkCollection.deleteOne(query)
            res.send(result)
        })

        // news related api

        app.get('/news', async (req, res) => {
            const cursor = newsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/news/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await newsCollection.findOne(query)
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
    res.send('futureTech server is running')
})

app.listen(port, () => {
    console.log(`futureTech server is running on port ${port}`)
})