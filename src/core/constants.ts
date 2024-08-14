import { config } from "dotenv"

config()

export const MONGO_URI: string = process.env.MONGO_URI || ""
if (!MONGO_URI) {
	console.error("Missing MONGO_URI")
	process.exit(1)
}

export const JWT_SECRET: string = process.env.JWT_SECRET || ""
if (!JWT_SECRET) {
	console.error("Missing JWT_SECRET")
	process.exit(1)
}

export const PORT: string = process.env.PORT || ""
if (!PORT) {
	console.error("Missing PORT")
	process.exit(1)
}

export const GCP_OAUTH_CLIENT_ID: string = process.env.GCP_OAUTH_CLIENT_ID || ""
if (!GCP_OAUTH_CLIENT_ID) {
	console.error("Missing GCP_OAUTH_CLIENT_ID")
	process.exit(1)
}

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID || ""
if (!RAZORPAY_KEY_ID) {
	console.error("Missing RAZORPAY_KEY_ID")
	process.exit(1)
}

export const RAZORPAY_SECRET: string = process.env.RAZORPAY_SECRET || ""
if (!RAZORPAY_SECRET) {
	console.error("Missing RAZORPAY_SECRET")
	process.exit(1)
}
