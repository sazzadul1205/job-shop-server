const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();



//parsers
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-shop.scmo9ih.mongodb.net/?retryWrites=true&w=majority`;

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

        // collections 
        const jobsCollection = client.db('job-shop').collection('jobs')
        const bidsCollection = client.db('job-shop').collection('bids')



        // middleware to see if the token is valid
        const gateman = (req, res, next) => {
            const { token } = req.cookies
            if (!token) {
                return res.status(401).send({ message: 'You are not authorized' })
            }
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'You are not authorized' })
                }
                req.user = decoded
                next()
            });


        }

        // token genaration
        app.post('/api/v1/auth/access-token', (req, res) => {
            const user = req.body
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).send({ success: true })
        })

        // jobs section

        // show all the jobs
        // /jobs?category=${category}
        app.get('/api/v1/jobs', async (req, res) => {
            // sorting by category and email
            let queryObj = {};
            const category = req.query.category;
            const email = req.query.email;

            if (category) {
                queryObj.category = category;
            }
            if (email) {
                queryObj.email = email;
            }
            const cursor = jobsCollection.find(queryObj);
            const result = await cursor.toArray();

            res.send(result);
        });

        // show the individual jobs by id
        app.get('/api/v1/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        });

        // add new jobs
        app.post('/api/v1/jobs/add-new-job', async (req, res) => {
            const job = req.body;
            // console.log(job);
            const result = await jobsCollection.insertOne(job)
            res.send(result)
        })

        // Updated Existing Job
        app.put('/api/v1/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedJob = req.body;
            const job = {
                $set: {
                    email: updatedJob.email,
                    title: updatedJob.title,
                    deadline: updatedJob.deadline,
                    category: updatedJob.category,
                    minPrice: updatedJob.minPrice,
                    maxPrice: updatedJob.maxPrice,
                    description: updatedJob.description,
                    status: updatedJob.status,
                }
            };
            const result = await jobsCollection.updateOne(filter, job, options);
            res.send(result);
        });

        // delete a Existing 
        app.delete('/api/v1/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })

        // bid section
        // show all the bids
        app.get('/api/v1/bids', async (req, res) => {
            // sorting by email
            let queryObj = {};
            const bidderEmail = req.query.bidderEmail;
            const sellerEmail = req.query.sellerEmail;
            if (bidderEmail) {
                queryObj.bidderEmail = bidderEmail;
            }
            if (sellerEmail) {
                queryObj.sellerEmail = sellerEmail;
            }
            const cursor = bidsCollection.find(queryObj)
            const result = await cursor.toArray()

            res.send(result)
        })
        // show the individual bids by id
        app.get('/api/v1/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.findOne(query);
            res.send(result);
        });
        // add a new bid
        app.post('/api/v1/bids/add-new-bid', async (req, res) => {
            const bid = req.body;
            // console.log(bid);
            const result = await bidsCollection.insertOne(bid)
            res.send(result)
        })
        // Updated Existing bid
        app.put('/api/v1/bids/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBid = req.body;
            const bid = {
                $set: {
                    Bid: updatedBid.Bid,
                    bidderDeadline: updatedBid.bidderDeadline,
                    bidderEmail: updatedBid.bidderEmail,
                    maxPrice: updatedBid.maxPrice,
                    minPrice: updatedBid.minPrice,
                    sellerEmail: updatedBid.sellerEmail,
                    title: updatedBid.title,
                    status: updatedBid.status,
                }
            };
            console.log(bid)
            const result = await bidsCollection.updateOne(filter, bid, options);
            res.send(result);
            console.log(result);
        });


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
    res.send('Job Shop Server is Running');
});

app.listen(port, () => {
    console.log(`job Shop Server is Running on Port ${port}`);
});


