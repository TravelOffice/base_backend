import mongoose from 'mongoose';

interface Models {
}

export default class MongoProvider {
  models: Models;

  constructor() {
    this.models = {
    };
  }

  connect = async () => {
    await mongoose.connect(process.env.MONGO_ENDPOINT || '');
  };
}
