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

// Login route
const createUser=require('./routes/Admin/createUser');
app.use("/createUser", validate, createUser);

// Create user route
const login=require('./routes/common/login');
app.use('/login',login);

//for get all services
const getServices=require('./routes/Admin/getServices');
app.use('/getServices', validate, getServices);

//for place a order
const placeOrder=require('./routes/User/placeOrder');
app.use("/placeOrder", validate, placeOrder)

const userService=require('./routes/User/getUserServices');
app.use("/userServices", validate, userService);

const me=require('./routes/common/me');
app.use('auth/me', validate, me);

const getOrders = require('./routes/User/getOrders')
app.use('/getOrders', validate, getOrders);

const getTransactions =require('./routes/User/getTransactions');
app.use('/getTransactions', validate, getTransactions);

const createService = require('./routes/Admin/createService');
app.use('/createService', validate , createService);

const updateService = require('./routes/Admin/updateService');
app.use('/updateService', validate, updateService);

const getCustomServices = require('./routes/Admin/getCustomServices');
app.use('/getCustomServices', validate, getCustomServices);

const addBalance = require('./routes/Admin/addBalance');
app.use('/addBalance', validate, addBalance);

const changePassword = require('./routes/User/changePassword');
app.use('/changePassword', validate, changePassword);

const changeUserPassword = require('./routes/Admin/changeUserPassword');
app.use('/changeUserPassword', validate, changeUserPassword);

const getUser = require('./routes/Admin/getUser');
app.use('/getUser', validate, getUser);

const addService = require('./routes/Admin/addServices');
app.use('/addService', validate, addService);

const deleteService = require('./routes/Admin/deleteServices');
app.use('/deleteService', validate,  deleteService);

const deleteCustomServices = require('./routes/Admin/deleteService');
app.use('/deleteCustomServices', validate, deleteCustomServices);

const requestRefill = require('./routes/User/requestRefill');
app.use('/requestRefill', validate, requestRefill);

const requestRefillStatus = require('./routes/User/requestRefillStatus');
app.use('/requestRefillStatus', validate, requestRefillStatus)

const getOrderStatus = require('./routes/User/getOrderStatus');
app.use('/getOrderStatus', validate, getOrderStatus);

const initiatePhonePePayment = require('./routes/payment/initiatePhonePePayment');
app.use('/initiatePhonePePayment', validate, initiatePhonePePayment);


const phonePeCallback = require('./routes/payment/phonePeCallback');
app.use('/phonePeCallback', validate, phonePeCallback);

const checkPhonePePaymentStatus = require('./routes/payment/checkPhonePePaymentStatus');
app.use('/checkPhonePePaymentStatus', validate, checkPhonePePaymentStatus);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});