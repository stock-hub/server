import 'dotenv/config'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import Product from '../models/Product.model'
const MONGO_URI = process.env.MONGODB_URI

const connectToDB = async () => {
  try {
    const x = await mongoose.connect(MONGO_URI)
    const dbName = x.connections[0].name
    console.log(`Connected to Mongo! Database name: "${dbName}"`)
  } catch (err) {
    console.error('Error connecting to mongo: ', err)
  }
}

const adminId = process.env.ADMIN_ID
const tags = ['machinery', 'tools', 'construction', 'hammer']
const arrayElements = 4

const products = Array(arrayElements).fill({
  name: faker.commerce.productName(),
  description: faker.lorem.words(15),
  price: faker.finance.amount(1, 1000, 0),
  imageUrl: [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300'
  ],
  tags: faker.helpers.arrayElement(tags),
  onSell: faker.datatype.boolean(),
  user: adminId
})

const seedDB = async () => {
  try {
    const productsFromDB = await Product.create(products)
    console.log(`Created ${productsFromDB.length} products`)

    await mongoose.connection.close()
  } catch (err) {
    console.error(
      `An error occurred while creating products from the DB: ${err}`
    )
  }
}

const run = async () => {
  await connectToDB()
  await seedDB()
}

run()
