const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser=require('body-parser');
const db=require('./utils/db');
const validate = require('./middelwares/validate')

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://smm-frontend-omega.vercel.app'
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without origin (like mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // if using cookies or auth headers
}))

app.use(cookieParser());



app.use(bodyParser.json());


app.get("/check",(req,res)=>{
    res.status(200).json({msg:"all good"})
})

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});