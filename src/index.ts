import mongoose from 'mongoose';
import 'reflect-metadata';
import app from './app';

const PORT = Bun.env.PORT || 8080;
const MONGO_URI = Bun.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to MongoDB and listening on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
