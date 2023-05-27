const express = require('express')

const path = require('path')

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const app = express()

const PORT = process.env.PORT || 5000

app.set('view-engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: false}))
app.use(cookieParser())

app.use(async (req, res, next) => {
    if (req.cookies) {
        const access_token = req.cookies.access_token
        const refresh_token = req.cookies.refresh_token

        if (access_token == null || refresh_token == null) {
            next()
            return
        }

        try {
            const user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)

            req.current_user = user
        } catch {
            try {
                const token_exists = await prisma.refreshToken.findUnique({
                    where: {
                        token: refresh_token
                    }
                })

                if (token_exists) {
                    const refresh_token_user = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)

                    const user = await prisma.user.findUnique({
                        where: {
                            username: refresh_token_user.username
                        }
                    })

                    const new_access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '30s' })

                    res.cookie('access_token', new_access_token, {httpOnly: true})

                    req.current_user = user
                }
            } catch {
                res.clearCookie('access_token')
                res.clearCookie('refresh_token')
            }
        }
    }

    next()
})

app.use('/', require('./routes/main'))
app.use('/auth/', require('./routes/auth'))
app.use('/deal/', require('./routes/deals'))

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
