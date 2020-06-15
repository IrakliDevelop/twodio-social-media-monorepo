import mongoose from 'mongoose';
import config from './config';

mongoose.connect(config.mongodb.url)
  .then(() => console.log('Mongodb connected!'));
