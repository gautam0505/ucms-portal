import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hash } from "bcrypt"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { name, email, mobile, password, otp } = await request.json()

    // Validate required fields
    if (!name || !email || !mobile || !password || !otp) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Verify OTP
    const { data: otpRecord } = await supabase
      .from("otps")
      .select("*")
      .eq("mobile", mobile)
      .eq("otp", otp)
      .eq("purpose", "registration")
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase.from("users").select("*").eq("email", email).single()

    if (existingEmail) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 400 })
    }

    // Check if mobile already exists
    const { data: existingMobile } = await supabase.from("users").select("*").eq("mobile", mobile).single()

    if (existingMobile) {
      return NextResponse.json({ message: "Mobile number is already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: "citizen", // Default role for registration
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    // Delete used OTP
    await supabase.from("otps").delete().eq("mobile", mobile).eq("otp", otp)

    return NextResponse.json({
      message: "User registered successfully",
      userId: user.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
