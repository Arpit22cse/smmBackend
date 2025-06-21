const express = require('express');
const router = express.Router();
const db = require('../../utils/db');
require('dotenv').config();

const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;
const sampleOrders = [
  {
    orderId: "ORD-2023-001",
    lastStatus: "Completed", // Using 'lastStatus'
    quantity: 1000,
    rate: 0.95,
    service: "Instagram Followers",
    user: "user_abc_id",
    refill: null, // Scenario 1: Refill not available (null)
    start_count: "3572", // Added start_count
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-12T11:30:00Z",
  },
  {
    orderId: "ORD-2023-002",
    lastStatus: "Pending",
    quantity: 500,
    rate: 1.20,
    service: "YouTube Views",
    user: "user_abc_id",
    refill: "", // Scenario 2: Refill available, not yet requested (empty string)
    start_count: "1234",
    createdAt: "2023-01-15T14:00:00Z",
    updatedAt: "2023-01-15T14:00:00Z",
  },
  {
    orderId: "ORD-2023-003",
    lastStatus: "In Progress",
    quantity: 200,
    rate: 0.80,
    service: "Twitter Likes",
    user: "user_xyz_id",
    refill: "REF-TW-L-98765", // Scenario 3: Refill requested, refillId present (non-empty string)
    start_count: "5000",
    createdAt: "2023-01-20T09:00:00Z",
    updatedAt: "2023-01-21T16:00:00Z",
  },
  {
    orderId: "ORD-2023-004",
    lastStatus: "Partial", // Example of 'Partial' status
    quantity: 750,
    rate: 0.60,
    service: "Facebook Shares",
    user: "user_abc_id",
    refill: null, // Another one with no refill
    start_count: "7890",
    createdAt: "2023-01-25T11:00:00Z",
    updatedAt: "2023-01-26T09:15:00Z",
  },
  {
    orderId: "ORD-2023-005",
    lastStatus: "Completed",
    quantity: 1500,
    rate: 0.45,
    service: "TikTok Followers",
    user: "user_xyz_id",
    refill: "", // Another one with refill available
    start_count: "9876",
    createdAt: "2023-02-01T17:00:00Z",
    updatedAt: "2023-02-03T08:00:00Z",
  },
  {
    orderId: "ORD-2023-006",
    lastStatus: "Canceled",
    quantity: 100,
    rate: 2.50,
    service: "Website Traffic",
    user: "user_abc_id",
    refill: null, // Canceled order, no refill
    start_count: "100",
    createdAt: "2023-02-05T10:00:00Z",
    updatedAt: "2023-02-05T11:00:00Z",
  },
  {
    orderId: "ORD-2023-007",
    lastStatus: "Completed",
    quantity: 2000,
    rate: 0.30,
    service: "Instagram Likes",
    user: "user_xyz_id",
    refill: "REF-IG-L-ACTIVE-123", // Another with active refill request
    start_count: "2233",
    createdAt: "2023-02-10T13:00:00Z",
    updatedAt: "2023-02-12T10:00:00Z",
  },
];

// Example of how you might pass this data to your OrderCard component:
// In your parent component (e.g., UserDashboardPage), you would map over this array:

/*
  <div className="order-cards-container">
    {sampleOrders.map(order => (
      <OrderCard key={order.orderId} order={order} onOrderUpdate={handleRefreshOrder} />
    ))}
  </div>
*/
// GET /user/orders - Get all orders
router.get('/', async (req, res) => {

    try {
        // userId from authenticated user (assuming it's a unique string, not MongoDB's _id)
        const userId = req.user.id; // e.g., 'user123' from your UserSchema.userId

        // --- Pagination Parameters ---
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Find the user document to get their MongoDB _id
        const user = await db.collection('users').findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const userObjectId = user._id; // This is the ObjectId we use for references

        // 2. Fetch orders for this user with pagination
        // Ensure you have an index on 'user' and 'createdAt' in the 'orders' collection for performance
        const orders = await db.collection('orders')
                               .find({ user: userObjectId })
                               .sort({ createdAt: -1 }) // Sort by creation date, newest first, crucial for consistent pagination
                               .skip(skip)
                               .limit(limit)
                               .toArray();


        

        // 5. Send the paginated and potentially updated orders data to the frontend
        res.status(200).json({ success: true, data: sampleOrders  });

    } catch (error) {
        console.error('Error in /orders route:', error);
        res.status(500).json({ success: false, message: 'Server Error: An error occurred while fetching and updating orders.' });
    }
});

module.exports = router;
