const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = 5000;


app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('hello world')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sc7dsau.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
try{

 await client.connect();

 const db = client.db('movies_db')

 const moviesCollection = db.collection('movies')
 const usersCollection = db.collection('users');

app.get('/movies/recentlyAdded', async (req, res)=>{

const cursor = moviesCollection.find().sort({addedAt: -1}).limit(6)
const result = await cursor.toArray()
res.send(result)
})

//  user related apis 
app.post('/users', async (req, res)=>{
  const newUser = req.body;
  const email = newUser.email;
  const query = {email: email}
  const existingUser = await usersCollection.findOne(query)

  if(existingUser){
res.send({message: 'user already exist. do not need to insert again'})
  }
  else{
    const result = await usersCollection.insertOne(newUser)
    res.send(result)
  }

})


app.post('/movies', async(req, res)=>{
  const newMovies = req.body;
  console.log(newMovies)
  const result = await moviesCollection.insertOne(newMovies)
  console.log('result is',result)
  res.send(result)
})

// state sections api 
app.get('/stats', async (req, res) => {
   
        
        const totalMovies = await moviesCollection.estimatedDocumentCount();
        const totalUsers = await usersCollection.estimatedDocumentCount();
        res.send({ totalMovies, totalUsers }); 

});

app.get('/movies/top-rated', async (req, res)=>{
  const topRatedMovies = moviesCollection.find();
  const cursor = topRatedMovies.sort({rating: -1}).limit(5)
  const result = await cursor.toArray();
  res.send(result)

})

app.delete('/movies/:id', async (req, res)=>{
  const id = req.params.id;

  const query = {_id: new ObjectId(id)}
  const result = await moviesCollection.deleteOne(query);
  res.send(result)

})

app.get('/movies', async (req, res) => {
  const cursor =  moviesCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/movies/:id',async (req, res)=>{
  const id = req.params.id;
  console.log('id', id)
  const query = {_id: id}
  const result = await moviesCollection.findOne(query)
  // console.log('GET /movies result:', result); 
 
  res.send(result)
})

await client.db('admin').command({ping:1})
console.log("Pinged your deployment. You successfully connected to MongoDB!");

}


finally{
//  await client.close();
}
}
run().catch(console.dir)

app.listen(port, ()=>{
    console.log(`smart server running on port ${port}`)
})