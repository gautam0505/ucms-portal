import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSupabaseUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) {
      console.error("Unauthorized: No user found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const date = searchParams.get("date") || "";
    const search = searchParams.get("search") || "";
    console.log("Fetching complaints with params:", {
      page,
      status,
      category,
      date,
      search,
    });
    console.log("User:", user);
    const limit = 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build filter conditions
    let query = supabase
      .from("complaints")
      .select(
        `id, title, category, status, created_at, escalation, assigned_to, user_id,
         user_profile:profiles!complaints_user_id_fkey(id, full_name, email),
         assigned_profile:profiles!complaints_assigned_to_fkey(id, full_name, email)`
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    // Role-based filtering
    if (user.role === "citizen") {
      query = query.eq("user_id", user.id);
    } else if (user.role === "official") {
      // Officials: assigned to them or unassigned
      query = query.or(`assigned_to.eq.${user.id},assigned_to.is.null`);
    }
    // Admin: see all

    if (status && status !== "all") query = query.eq("status", status);
    if (category && category !== "all") query = query.eq("category", category);
    if (date)
      query = query
        .gte("created_at", date)
        .lt(
          "created_at",
          new Date(new Date(date).getTime() + 86400000).toISOString()
        );
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Format the data for the frontend
    const formattedComplaints = (data || []).map((complaint: any) => ({
      id: complaint.id,
      title: complaint.title,
      category: complaint.category,
      date: complaint.created_at,
      status: complaint.status,
      escalation: complaint.escalation,
      assignedTo: complaint.assigned_to,
      citizen: {
        name: complaint.user_profile?.full_name,
        email: complaint.user_profile?.email,
      },
      assignedProfile: complaint.assigned_profile || null,
    }));

    return NextResponse.json({
      complaints: formattedComplaints,
      totalPages: count ? Math.ceil(count / limit) : 1,
      currentPage: page,
      totalComplaints: count || 0,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    // Validate required fields
    const requiredFields = [
      "title",
      "category",
      "description",
      "address",
      "latitude",
      "longitude",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert complaint into Supabase (use supabaseAdmin for server-side write)
    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .insert([
        {
          title: data.title,
          category: data.category,
          subcategory: data.subcategory || null,
          description: data.description,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          status: "Pending",
          user_id: user.id,
          escalation: "None",
          assigned_to: null,
        },
      ])
      .select()
      .single();
    if (error) throw error;

    // Insert timeline event (use supabaseAdmin for server-side write)
    await supabaseAdmin.from("timeline").insert([
      {
        complaint_id: complaint.id,
        action: "Complaint Lodged",
        description: "Complaint submitted successfully",
        by: `Citizen: ${user.id}`,
      },
    ]);

    return NextResponse.json({
      message: "Complaint created successfully",
      complaintId: complaint.id,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { message: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
