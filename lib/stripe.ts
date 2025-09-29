import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Pin to a stable, GA API version supported by the installed SDK
  apiVersion: "2024-12-18",
})
