import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all complaints (Supabase does not support groupBy, so we aggregate in JS)
    const { data: complaints, error } = await supabaseAdmin
      .from("complaints")
      .select("category");
    if (error) throw error;

    // Count complaints by category
    const categoryCounts: Record<string, number> = {};
    for (const complaint of complaints || []) {
      if (!complaint.category) continue;
      categoryCounts[complaint.category] =
        (categoryCounts[complaint.category] || 0) + 1;
    }

    // Format data for pie chart
    const chartData = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
      })
    );

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching category chart data:", error);
    return NextResponse.json(
      { message: "Failed to fetch category data" },
      { status: 500 }
    );
  }
}
