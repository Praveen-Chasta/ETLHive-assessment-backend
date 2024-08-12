const express = require('express');

const router = express.Router();

const cors = require('cors');

const {test, signup, loginUser, userProfile, userLogout, getUsers, updateUser, deleteUser, verifyEmail} = require('../controller/authController')

const { check } = require('express-validator');

router.use(
    cors({
        credentials : true,
        origin : ['https://66ba05271c5cc28cd2094c16--sprightly-custard-74ad0f.netlify.app']
    })
)

router.get('/', test);
router.post('/signup', signup);
router.post('/login', loginUser);
router.get('/profile', userProfile);
router.post('/logout', userLogout);

router.get('/get-users', getUsers);
router.put('/update/:id', updateUser);  
router.delete('/delete/:id', deleteUser)

// router.post('/verify-user-email', verifyEmail)

router.post('/verify-user-email',
    [
        check('email', 'Please include a valid email').isEmail()
    ],
    verifyEmail
);


module.exports = router
