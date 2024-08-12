const User = require('../models/users');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');

const {hashPassword ,comparePassword} = require('../helpers/authPassword')

const test = (req,res) => {
    res.json('test is working')
}

// Sign Up Route

const signup = async (req, res) => {
    try {
        const { username, email,  password } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        if (!email){
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        } else if (password.length < 7) {
            return res.status(400).json({ error: "Password must be at least 7 characters long" });
        } else if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
        } else if (!/[a-z]/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
        } else if (!/[0-9]/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one number" });
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one special character" });
        }

        const exist = await User.findOne({ email });

        if (exist) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        const hashedPassword = await hashPassword(password)

        const user = await User.create({ username, email , password : hashedPassword});
            
        res.status(200).json({ message: "User signed up successfully", user });
       

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


// Login Route

const loginUser = async(req, res) => {
    try{
        const {username, password} = req.body;
        

        console.log("Username:", username);
        console.log("Password:", password);

        const user = await User.findOne({username})

        console.log("User from DB:", user);

        if(!user){
            return res.status(400).json({
                error : "No User Found"
            })
        }

        console.log("Password provided by user:", password);
        console.log("Hashed password from DB:", user.password);

        const match = await comparePassword(password, user.password)

        if(match){
           jwt.sign({email : user.email , username : user.username, id: user._id}, process.env.JWT_SCRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user)
           })
        }

        console.log("Password match result:", match);

        if(!match){
            return res.status(400).json({error : "Password is Incorrect"})
        }
    }

    catch(error){
        console.log(error)
    }
}


// User Profile Route

const userProfile = (req,res) => {
    const {token} = req.cookies
    if(token){
        jwt.verify(token, process.env.JWT_SCRET, {}, (err, user) => {
            if(err) throw err;
            res.json(user)
        })
    }
    else{
        res.json(null)
    }
}

// User Logout

const userLogout = (req, res) => {
    res.clearCookie('token'); 
    return res.status(200).json({ message: 'Logged out successfully' });
};

// Get Users

const getUsers = async (req, res) => {
    try {
        const users = await User.find(); 
        res.status(200).json(users); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Update Users

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        
        const user = await User.findByIdAndUpdate(userId, updatedData, {
            new: true,
            runValidators: true, 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({message: "User Updated Successfully"});
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Delete User

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by ID and delete
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Verify Email

const verifyEmail = async (req, res) => {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
    
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    test,
    signup,
    loginUser,
    userProfile,
    userLogout,
    getUsers,
    updateUser,
    deleteUser,
    verifyEmail
}
