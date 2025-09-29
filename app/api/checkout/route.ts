import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { convertUsdCentsToInrPaise } from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as {
      items: Array<{ productId: string; title: string; priceCents: number; qty: number; size: string }>
    }

    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${siteUrl}/account?paid=1`,
      cancel_url: `${siteUrl}/cart`,
      line_items: items.map((it) => ({
        price_data: {
          currency: "inr",
          product_data: { name: `${it.title} (${it.size})` },
          unit_amount: convertUsdCentsToInrPaise(it.priceCents),
        },
        quantity: it.qty,
      })),
      metadata: {
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
