const express = require('express');
const Service = require('../../models/Service');

const router = express.Router();

// Route: POST /
router.post('/', async(req, res) => {
    // Your logic to create a service goes here
    if(req.user.role!=='admin'){
        return res.status(400).json({ error:'you are not a admin' });
    }


    try {
        const { serviceId, service, name, internalName, rate, min, max, refill } = req.body;
        const serv = new Service({ serviceId, service, name, internalName, rate, min, max, refill});
        await serv.save();
        return res.status(200).json({message: "new Service created", data:{service, serviceId, name, rate, min, max}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to create service', details: error.message });
    }
    
});

module.exports = router;