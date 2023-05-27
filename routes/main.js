const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    if (req.current_user){
        return res.redirect('/1')
    }
    const car_count = prisma.car.count({})
    const popular_cars = prisma.car.findMany({
        take: 8
    })
    const small_cars = prisma.car.findMany({
        take: 8,
        where: {
            type: 'SMALL'
        }
    })
    const big_cars = prisma.car.findMany({
        take: 8,
        where: {
            type: 'BIG'
        }
    })
    const exclusive_cars = prisma.car.findMany({
        take: 8,
        where: {
            type: 'EXCLUSIVE'
        }
    })
    res.render('index.ejs', {
        popular_cars: await popular_cars,
        small_cars: await small_cars,
        big_cars: await big_cars,
        exclusive_cars: await exclusive_cars,
        car_count: await car_count
    })
})

router.get('/:last_id', async (req, res) => {
    if (req.current_user){
        const last_id = parseInt(req.params.last_id) - 1
        const car_count = prisma.car.count({})
        if (last_id === 0) {
            const cars = prisma.car.findMany({
                take: 8
            })
            return res.render('main.ejs', {
                cars: await cars,
                car_count: await car_count
            })
        }
        const cars = prisma.car.findMany({
            take: 8,
            skip: 1,
            cursor: {
                id: last_id
            }
        })
        return res.render('main.ejs', {
            cars: await cars,
            car_count: await car_count
        })
    }
    return res.redirect('/')
})

module.exports = router
