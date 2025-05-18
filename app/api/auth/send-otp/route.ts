import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { mobile, purpose, role } = await request.json()

    if (!mobile) {
      return NextResponse.json({ message: "Mobile number is required" }, { status: 400 })
    }

    // Check if mobile number exists for registration
    if (purpose === "registration") {
      const { data: existingUser } = await supabase.from("users").select("*").eq("mobile", mobile).single()

      if (existingUser) {
        return NextResponse.json({ message: "Mobile number is already registered" }, { status: 400 })
      }
    }

    // Check if mobile number exists for login
    if (!purpose && role) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("mobile", mobile)
        .eq("role", role)
        .single()

      if (!existingUser) {
        return NextResponse.json({ message: "No account found with this mobile number" }, { status: 404 })
      }
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database with expiry (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await supabase.from("otps").insert({
      mobile,
      otp,
      expires_at: expiresAt.toISOString(),
      purpose: purpose || "login",
    })

    // In a real application, you would send the OTP via SMS
    // For development, we'll just log it
    console.log(`OTP for ${mobile}: ${otp}`)

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 })
  }
}
