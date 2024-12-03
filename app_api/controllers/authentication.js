const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async(req, res) => {
    if(!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({'message': 'All fields required!'});
    }
    try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password); // Assuming setPassword hashes the password
        await user.save(); // Async save method
        const token = user.generateJWT(); // Generate JWT after saving
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error during registration:", err); // 에러 로그 추가
        return res.status(400).json({
            message: 'Error registering user',
            error: err.message || err, // 에러 메시지 출력
        });
    }
}
const login = (req, res) => {
    if(!req.body.email || !req.body.password) {
        return res.status(400).json({'message': 'All fields required'});
    }
    passport.authenticate('local', (err, user,info) => {
        let token;
        if(err) {
            console.log(err)
            return res.status(404).json({token});
        }
        if(user) {
            token = user.generateJWT();
            res.status(200).json({token})
        }else {
            res.status(401).json(info)
        }
    })(req, res);
}

module.exports = {
    register,
    login
}