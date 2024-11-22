// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');

// dotenv.config();
// const app = express();

// app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
// app.use(express.json());

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('Error connecting to MongoDB:', err));

// const bookingSchema = new mongoose.Schema({
//   name: String,
//   college: String,
//   dayPass: String,
//   members: [{ name: String, college: String, contact: String, email: String, events: [String] }],
//   referralCode: String,
//   totalPrice: Number,
//   paymentProof: String,
// });

// const Booking = mongoose.model('Booking', bookingSchema);

// app.get('/' , (req,res) => {
//   res.status(200).json({message : "success"});
// })


// app.post('/api/booking', async (req, res) => {
//   const { name, college, dayPass, members,referralCode, totalPrice } = req.body;
//   try {
//     const newBooking = new Booking({ name, college, dayPass, members,referralCode,  totalPrice });
//     await newBooking.save();
//     res.status(201).json({ message: 'Booking successful', booking: newBooking });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to book', error });
//   }
// });

// app.post('/api/upload-proof', upload.single('proof'), async (req, res) => {
//   const { bookingId } = req.body;
//   try {
//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });

//     booking.paymentProof = req.file.filename;
//     await booking.save();
//     res.status(200).json({ message: 'Proof uploaded successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to upload proof', error });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const    CloudinaryStorage = require('multer-storage-cloudinary');

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  
    folder: 'payment_proofs', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'pdf'], // Allowed file formats
  
});
const upload = multer({ storage });

// MongoDB Schema and Model
const bookingSchema = new mongoose.Schema({
  name: String,
  college: String,
  dayPass: String,
  members: [{ name: String, college: String, contact: String, email: String, events: [String] }],
  referralCode: String,
  totalPrice: Number,
  paymentProof: String, // Cloudinary URL
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'success' });
});

app.post('/api/booking', async (req, res) => {
  const { name, college, dayPass, members, referralCode, totalPrice } = req.body;
  try {
    const newBooking = new Booking({ name, college, dayPass, members, referralCode, totalPrice });
    await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to book', error });
  }
});

app.post('/api/upload-proof', async (req, res) => {
  const { bookingId , proof} = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    booking.paymentProof = proof; 
    await booking.save();
    res.status(200).json({ message: 'Proof uploaded successfully', url: booking.paymentProof });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload proof', error });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

