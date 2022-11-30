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

        app.get('/watchCategories/:id', async (req, res) => {
        
            const id = req.params.id;
            const query = { category_id: id };
          
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });


        app.get('/bookings', async (req, res) => {
            
            const email = req.query.email;

            console.log('token', req.headers.authorization);
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
        app.post('/users', async (req, res) => {
            
            const user = req.body;
            const result = await usersCollection.insertOne(user);
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