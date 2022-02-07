import mongoose, { Model } from 'mongoose';
import { Tour } from '../models/Tour';
import TourModel from './database/mongo/models/TourModel';

interface Models {
  TourModel: Model<Tour>
}

export default class MongoProvider {
  models: Models;

  constructor() {
    this.models = {
      TourModel,
    };
  }

  connect = async () => {
    await mongoose.connect(process.env.MONGO_ENDPOINT || '');
  };
}
