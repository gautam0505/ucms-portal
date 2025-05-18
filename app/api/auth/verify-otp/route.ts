import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sign } from "jsonwebtoken"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { mobile, otp, role } = await request.json()

    if (!mobile || !otp) {
      return NextResponse.json({ message: "Mobile number and OTP are required" }, { status: 400 })
    }

    // Verify OTP
    const { data: otpRecord } = await supabase
      .from("otps")
      .select("*")
      .eq("mobile", mobile)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Get user by mobile number
    const { data: user } = await supabase.from("users").select("*").eq("mobile", mobile).eq("role", role).single()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete used OTP
    await supabase.from("otps").delete().eq("mobile", mobile).eq("otp", otp)

    // Generate a special token for OTP login
    const token = sign({ id: user.id, email: user.email, role: user.role }, process.env.SUPABASE_JWT_SECRET!, {
      expiresIn: "15m",
    })

    return NextResponse.json({
      email: user.email,
      token,
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 })
  }
}
