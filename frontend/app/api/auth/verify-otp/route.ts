import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data?.session) {
      const response = NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
      })

      response.cookies.set({
        name: "sb-access-token",
        value: data.session.access_token,
        maxAge: data.session.expires_in,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      response.cookies.set({
        name: "sb-refresh-token",
        value: data.session.refresh_token,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      return response
    }

    return NextResponse.json({ error: "No session returned" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
