const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/create', userAuthenticated, (req, res) => {
    res.render('create-deal.ejs')
})

router.post('/create', userAuthenticated, async (req, res) => {
    const lessor_id = req.current_user.id
    const title = req.body.title
    const price = parseFloat(req.body.price)
    const car_type = req.body.car_type

    try {
        const car = await prisma.car.create({
            data: {
                title: title,
                price: price,
                lessorId: lessor_id,
                type: car_type
            }
        })
        return res.redirect(`/deal/${car.id}`)
    } catch{
        return res.redirect('/deal/create')
    }
})

router.get('/:car_id', userAuthenticated, async (req, res) => {
    const car_id = parseInt(req.params.car_id)

    try {
        const car = await prisma.car.findUnique({
            where: {
                id: car_id
            }
        })

        return res.render('show-deal.ejs', {car: car})
    } catch {
        return res.sendStatus(404)
    }
})

function userAuthenticated(req, res, next) {
    if (req.current_user == null) return res.redirect('/auth/login')
    next()
}

module.exports = router
