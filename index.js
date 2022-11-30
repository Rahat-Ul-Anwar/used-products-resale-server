const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');


app.use(express.json());
app.use(cors());

app.get('/', async(req, res) => {
    res.send('used products resale side is running');

})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yagkdpa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// verify jwt middleware

function verifyJWT(req, res, next) {
    
    console.log('token in jwt', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();

    })
}

async function run() {
    try {
        const watchCategoriesCollection = client.db('usedProducts').collection('watchCategories');
        const productsCollection = client.db('usedProducts').collection('products');
        const bookingsCollection = client.db('usedProducts').collection('bookings');
        const usersCollection = client.db('usedProducts').collection('users');
        

        app.get('/watchCategories', async (req, res) => {
          
            const query = {};
            const categories = await watchCategoriesCollection.find(query).toArray();
            res.send(categories);

        })

        app.get('/watchCategories/:id',  async (req, res) => {
        
            const id = req.params.id;
            const query = { category_id: id };
          
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });


        app.get('/bookings', verifyJWT, async (req, res) => {
            
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            // console.log('token', req.headers.authorization);
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })


        app.post('/bookings', async (req, res) => {
            
            const booking = req.body;
            // console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);

        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if(user) {
                
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token });
            }
           
            res.status(403).send({accessToken: ''});

        })

        //for users

        app.get('/users', async (req, res) => {
            
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            
            const email = req.params.email;
            const query = {email };
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === "admin"});


        })
        app.post('/users', async (req, res) => {
            
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                
                return res.status(403).send({ message: 'forbidden access' });

            }
            
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })
        
    }
    finally {
        

    }
}

run().catch(console.log);




app.listen(port, () => {
    console.log(`Used Products resale server is running on port ${port}`);
})