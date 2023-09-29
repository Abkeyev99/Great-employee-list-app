const {prisma} = require('../prisma/prisma-client')
const brypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @route- POST/API/user/login
// @desc- логин
// @access- public

const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Пожалуйста, заполните обязательные все поля'})
    }

    const user = await prisma.user.findFirst({
        where: {
            email,
        }
    });

    const isPasswordCorrect = user && (await bryp.compare(password, user.password));

    if (user && isPasswordCorrect) {
        res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name
        })
    } else {
        return res.status(400).json({message: 'Неверно введен логин или пароль'})
    }
}


// @route- POST/API/user/register
// @desc- регистрация
// @access- public


const register = async (req, res) => {
    const {email, password, name} = req.body;

    if (!email || !password || !name) {
        return res.send(400).json({message: 'Пожалуйста, заполните обязательные все поля'})
    }
    const registeredUser = await prisma.user.findFirst({
        where: {
            email,
        }
    });
    if (registeredUser) {
        return res.status(400).json({message: 'Ползователь, с таким email уже существует'})
    }

    const salt = await brypt.genSalt(10);
    const hashedPassord = await brypt.hash(password, salt)

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassord
        }
    });
    const secret = process.env.JWT_SECRET;

    if (user && secret) {
        res.status(201).json({
            id: user.id,
            email: user.email,
            name,
            token: jwt.sing({id: user.id}, secret, {expiresin: '30d'})
        })
    } else {
        return res.status(400).json({message: 'Не удалось создать пользователя'})
    }
}


const current = async (req, res) => {
    res.send('current');
}


module.exports = {
    login,
    register,
    current
}