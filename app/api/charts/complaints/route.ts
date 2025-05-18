import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // Get date range based on period
    const now = new Date();
    const startDate = new Date();
    let format: "day" | "date" | "month" = "day";

    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
      format = "day";
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
      format = "date";
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
      format = "month";
    }

    // Get all complaints in the date range
    const { data: complaints, error } = await supabaseAdmin
      .from("complaints")
      .select("created_at, status")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString());
    if (error) throw error;

    // Process data based on period
    let chartData: any[] = [];

    if (format === "day") {
      // Group by day of week
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayData = Array(7)
        .fill(0)
        .map((_, i) => ({
          name: days[i],
          total: 0,
          resolved: 0,
        }));

      (complaints || []).forEach((complaint) => {
        const day = new Date(complaint.created_at).getDay();
        dayData[day].total++;
        if (complaint.status === "Resolved") {
          dayData[day].resolved++;
        }
      });

      chartData = dayData;
    } else if (format === "date") {
      // Group by date of month
      const daysInMonth = 30;
      const dateData = Array(daysInMonth)
        .fill(0)
        .map((_, i) => ({
          name: `${i + 1}`,
          total: 0,
          resolved: 0,
        }));

      (complaints || []).forEach((complaint) => {
        const date = new Date(complaint.created_at).getDate() - 1;
        if (date < daysInMonth) {
          dateData[date].total++;
          if (complaint.status === "Resolved") {
            dateData[date].resolved++;
          }
        }
      });

      chartData = dateData;
    } else if (format === "month") {
      // Group by month
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthData = Array(12)
        .fill(0)
        .map((_, i) => ({
          name: months[i],
          total: 0,
          resolved: 0,
        }));

      (complaints || []).forEach((complaint) => {
        const month = new Date(complaint.created_at).getMonth();
        monthData[month].total++;
        if (complaint.status === "Resolved") {
          monthData[month].resolved++;
        }
      });

      chartData = monthData;
    }

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching complaint chart data:", error);
    return NextResponse.json(
      { message: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
