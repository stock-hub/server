import 'dotenv/config'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import Product, { IProduct } from '../models/Product.model'

type seedProduct = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>

const MONGO_URI = process.env.MONGODB_URI
const ADMIN_ID = process.env.ADMIN_ID
const TAGS = ['machinery', 'tools', 'construction', 'hammer']
const ARRAY_ELEMENTS = 8

const connectToDB = async () => {
  try {
    const { connections } = await mongoose.connect(MONGO_URI)
    console.log(`Connected to Mongo! Database name: "${connections[0].name}"`)
  } catch (error) {
    console.error('Error connecting to mongo: ', error)
  }
}

const generateProduct = (): seedProduct => ({
  name: faker.commerce.productName(),
  description: faker.lorem.words(15),
  price: parseFloat(faker.finance.amount({ min: 1, max: 1000, dec: 0 })),
  imageUrl: Array.from({ length: 5 }, () => faker.image.url()),
  tags: faker.helpers.arrayElements(TAGS, 2),
  onSell: faker.datatype.boolean(),
  inStock: faker.datatype.boolean(),
  user: ADMIN_ID as any
})

const seedDB = async () => {
  try {
    const products: seedProduct[] = Array.from(
      { length: ARRAY_ELEMENTS },
      generateProduct
    )
    const productsFromDB = await Product.create(products)
    console.log(`Created ${productsFromDB.length} products`)
    await mongoose.connection.close()
  } catch (error) {
    console.error(
      'An error occurred while creating products from the DB: ',
      error
    )
  }
}

const run = async () => {
  await connectToDB()
  await seedDB()
}

run()
