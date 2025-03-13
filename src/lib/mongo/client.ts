import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  file: Buffer
});

export default mongoose.model('Template', TemplateSchema);