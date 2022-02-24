import { model, Schema } from 'mongoose';
import { Tour } from '../../../../models/Tour';

const schema = new Schema<Tour>({
  name: { type: String, required: true },
});

const TourModel = model<Tour>('Example', schema);

export default TourModel;
