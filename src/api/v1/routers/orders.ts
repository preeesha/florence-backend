import { Request, Response, Router } from "express"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import Razorpay from "razorpay"

import {
	JWT_SECRET,
	RAZORPAY_KEY_ID,
	RAZORPAY_SECRET,
} from "../../../core/constants"
import { Order } from "../models/orders"
import { Product } from "../models/product"
import { User } from "../models/user"

export const orderRouter = Router()

orderRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req.params.id
	let order = await Order.findOne({ id: { $eq: id } })
	res.status(200).send({ order: order })
})

orderRouter.get("/all", async (req: Request, res: Response) => {
	// TODO:
	const token = req.headers["authorization"]!.replace("Bearer", "").trim()

	if (!token) {
		res.status(404).send({ message: "orders not found" })
		return
	}

	try {
		const tokenemail = jwt.verify(token, JWT_SECRET)

		if (!tokenemail || typeof tokenemail !== "string") {
			res.status(400).send({ message: "Invalid token format" })
			return
		}

		const user = await User.findOne({ email: tokenemail })

		if (!user) {
			res.status(404).send({ message: "User not found" })
			return
		}

		const userId = user._id.toString()
		const orders = await Order.find({ userID: new ObjectId(userId) })

		res
			.status(200)
			.send({ orders: orders, message: "order fetched successfully" })
		return
	} catch (error) {
		// Handle JWT verification errors
		console.error("JWT verification error:", error)
		res.status(401).send({ message: "Unauthorized" })
		return
	}
})

orderRouter.post("/create", async (req: Request, res: Response) => {
	var instance = new Razorpay({
		key_id: RAZORPAY_KEY_ID,
		key_secret: RAZORPAY_SECRET,
	})

	const order = await instance.orders.create({
		amount: +req.body["amount"],
		currency: "INR",
		receipt: "receipt#1",
	})

	res.status(200).send({
		message: "order created successfully",
		order: order,
	})
})

orderRouter.post("/place", async (req: Request, res: Response) => {
	let razorpay_order_id = await Order.findOne({
		id: { $eq: req.body["razorpay_order_id"] },
	})
	let razorpay_payment_id = await Order.findOne({
		id: { $eq: req.body["razorpay_payment_id"] },
	})
	let razorpay_signature = await Order.findOne({
		id: { $eq: req.body["razorpay_signature"] },
	})
	if (razorpay_order_id || razorpay_payment_id || razorpay_signature) {
		res.status(400).send({ message: "the order is already created" })
		return
	}

	var instance = new Razorpay({
		key_id: RAZORPAY_KEY_ID,
		key_secret: RAZORPAY_SECRET,
	})
	const orderPaid = (
		await instance.orders.fetchPayments(req.body["razorpay_order_id"])
	).count
	if (!orderPaid) {
		res.status(400).send({ message: "the order is not paid" })
		return
	}
	const productIds = Object.keys(req.body["cart"])

	let products = await Product.find({ id: { $in: productIds } })
	let productPrices: { [key: string]: number } = {}

	for (let product of products) {
		productPrices[product.id] = product.price
	}

	const order = new Order({
		id: req.body["razorpay_order_id"],
		userID: req.body["userId"],
		razorpay_payment_id: req.body["razorpay_payment_id"],
		razorpay_signature: req.body["razorpay_signature"],
		orderItems: req.body["cart"],
		timestamps: {
			placed: Date.now(),
			transit: 0,
			delivered: 0,
		},
		currentStatus: "placed",
		priceItems: productPrices,
	})

	const validOrderError = order.validateSync()
	if (validOrderError) {
		res.status(400).send({ message: validOrderError.message })
		return
	}

	await order.save()

	res
		.status(200)
		.send({ message: "order placed successfully", orderId: order.id })
})