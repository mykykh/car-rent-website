const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/', (req, res) => {
    if (req.current_user){
        return res.render('main.ejs')
    }
    res.render('index.ejs')
})

module.exports = router
