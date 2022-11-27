const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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

        app.get('/watchCategories', async (req, res) => {
          
            const query = {};
            const categories = await watchCategoriesCollection.find(query).toArray();
            res.send(categories);

        })
        
    }
    finally {
        

    }
}

run().catch(console.log);




app.listen(port, () => {
    console.log(`Used Products resale server is running on port ${port}`);
})