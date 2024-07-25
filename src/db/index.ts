import mongoose from 'mongoose'

const MONGO_URI: string = process.env.MONGODB_URI

mongoose
  .connect(MONGO_URI)
  .then(res => {
    console.log(
      `Connected to Mongo! Database name: "${res.connections[0].name}"`
    )
  })
  .catch(error => {
    console.error('Error connecting to mongo: ', error)
  })
