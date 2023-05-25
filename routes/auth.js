const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get('/register', userNotLogedIn, (req, res) => {
    res.render('register.ejs')
})

router.post('/register', userNotLogedIn, async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const raw_password = req.body.password
    const repeat_password = req.body.repeat_password

    if (raw_password !== repeat_password) {
        return res.redirect('/auth/register?error=password_not_match')
    }

    try {
        const user_count = await prisma.user.count({
            where: {
                OR: [
                    {username: { equals: username}},
                    {email: {equals: email}}
                ]
            }
        })

        if (user_count != 0) {
            return res.redirect('/auth/register?error=user_exists')
        }
    } catch {
        return res.redirect('/auth/register?error=fail_to_find')
    }

    try {
        const hashed_password = await bcrypt.hash(raw_password, 10)

        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashed_password
            }
        })

        return res.redirect('/auth/login')
    } catch {
        return res.redirect('/auth/register?error=fail_to_create')
    }

})

router.get('/login', userNotLogedIn, (req, res) => {
    res.render('login.ejs')
})

router.post('/login', userNotLogedIn, async (req, res) => {
    const username = req.body.username
    const raw_password = req.body.password

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (user) {
            if (await bcrypt.compare(raw_password, user.password)) {

                const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30s' })
                const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

                const db_refresh_token = await prisma.refreshToken.create({
                    data: {
                        token: refresh_token
                    }
                })

                res.cookie('access_token', access_token, {httpOnly: true})
                res.cookie('refresh_token', refresh_token, {httpOnly: true})

                return res.redirect('/')
            }
            return res.redirect('/auth/login?error=incorect_password')
        }
        return res.redirect('/auth/login?error=user_not_found')
    } catch {
        return res.redirect('/auth/login?error=fail_to_find')
    }

})

router.post('/logout', async (req, res) => {
    const deletedToken = await prisma.refreshToken.delete({
        where: {
            token: req.cookies.refresh_token
        }
    })

    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res.redirect('/auth/login')
})

function userNotLogedIn(res, req, next) {
    if (res.current_user) return req.redirect('/')
    next()
}

module.exports = router
