const express = require("express");
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer")

const router = express.Router();

function generateToken(params = {}) {
   return jwt.sign(params, process.env.SECRET, {
        expiresIn: 86400,
    });
}


router.post('/register', async (req, res) => {
    const { email } = req.body;
    try{
        if(await User.findOne({ email })){
            return res.status(400).send({ error: 'User already exists' });
        }
        const user = await User.create(req.body);

        user.password = undefined;
        
        return res.send({ 
            user,
            token: generateToken({ id: user.id }),
        });
    } catch(err) {
        res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user){
        return res.status(400).send({ error: 'User not found' });
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Invalid Password' });
    }

    user.password = undefined;


    res.send({ 
        user, 
        token: generateToken({ id: user.id }),
    });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).send({ error: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'support@hsystems.com.br',
            template: 'forgot_password',
            subject: 'H$ystems - Recuperação de Senha',
            context: { token, user },
        }, (err) => {
            if(err) {
                res.status(400).send({error: 'Cannot send forgot password, try again'})
            }

            return res.send();
        })

    } catch (error) {
        res.status(400).send({error: 'Error on forgot password, try again.'})
    }
});


router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({email})
            .select('+passwordResetToken passwordResetExpires');

        if(!user){
            return res.status(400).send({ error: 'User not found' });
        }

        if(token !== user.passwordResetToken){
            return res.status(400).send({ error: 'Invalid Token' });
        }

        const now = new Date();
        if(now > user.passwordResetExpires) {
            return res.status(400).send({ error: 'Token Expired, generate a new one' });
        }

        user.password = password;

        await user.save();

        res.send();
    } catch (error) {
        res.status(400).send({error: 'Cannot reset password, try again'})
    }
});

router.get('/list_users', async(req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(400).send(err)
		console.log(err)
    }
})

module.exports = app => app.use('/auth', router); // /auth/register ou qualquer outra rota será /auth/{nome_rota} 
