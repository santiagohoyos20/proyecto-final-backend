import mongoose from 'mongoose';

export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI no está definido en .env');
    process.exit(1);
  }

  mongoose.connect(uri)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => {
      console.error('Error conectando a MongoDB:', err);
      process.exit(1);
    });
}
