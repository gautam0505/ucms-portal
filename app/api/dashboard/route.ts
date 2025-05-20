import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Return mock dashboard data for frontend demo
    return NextResponse.json({
      totalComplaints: 10,
      pendingComplaints: 3,
      resolvedComplaints: 5,
      escalatedComplaints: 2,
      recentComplaints: [
        {
          id: 1,
          title: "Pothole on Main Road",
          category: "roads",
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Water Supply Disruption",
          category: "water",
          createdAt: new Date(),
        },
      ],
      overdueComplaints: [
        {
          id: 3,
          title: "Streetlight not working",
          category: "",
          createdAt: new Date(),
          daysOverdue: 10,
        },
      ],
      activeUsers: [
        { id: 1, name: "Admin User", complaintCount: 5 },
        { id: 2, name: "Official User", complaintCount: 3 },
      ],
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
