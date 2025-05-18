import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// TODO: Replace this with your actual Supabase user/session logic
async function getSupabaseUser(request: NextRequest) {
  // Example: get user from cookies or headers if using Supabase Auth
  // For now, return a dummy user for development
  return {
    id: "dummy-user-id",
    role: "citizen",
    name: "Citizen User",
    email: "citizen@example.com",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const complaintId = params.id;
    // Get the complaint with attachments and timeline
    const { data: complaint, error } = await supabase
      .from("complaints")
      .select(
        `*, attachments(*), timeline(*), profiles:profiles(id, name, email, mobile)`
      )
      .eq("id", complaintId)
      .single();
    if (error || !complaint) {
      return NextResponse.json(
        { message: "Complaint not found" },
        { status: 404 }
      );
    }
    // Check if the user has access to this complaint
    const isOwner = complaint.user_id === user.id;
    const isOfficial = user.role === "official" || user.role === "admin";
    if (!isOwner && !isOfficial) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }
    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { message: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Only officials and admins can update complaints
    if (user.role !== "official" && user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }
    const complaintId = params.id;
    const data = await request.json();
    // Validate the complaint exists
    const { data: complaint, error: complaintError } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", complaintId)
      .single();
    if (complaintError || !complaint) {
      return NextResponse.json(
        { message: "Complaint not found" },
        { status: 404 }
      );
    }
    // Update the complaint
    const { data: updatedComplaint, error: updateError } = await supabase
      .from("complaints")
      .update({
        status: data.status || complaint.status,
        escalation: data.escalation || complaint.escalation,
        assigned_to: data.assignedTo || complaint.assigned_to,
      })
      .eq("id", complaintId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { message: "Failed to update complaint" },
        { status: 500 }
      );
    }
    // Add to timeline if there's a status change
    if (data.status && data.status !== complaint.status) {
      await supabase.from("timeline").insert([
        {
          action: "Status Updated",
          description: `Status changed from '${complaint.status}' to '${data.status}'`,
          by: `Officer: ${user.name || user.email}`,
          complaint_id: complaintId,
        },
      ]);
    }
    // Add comment to timeline if provided
    if (data.comment) {
      await supabase.from("timeline").insert([
        {
          action: "Comment Added",
          description: data.comment,
          by: `Officer: ${user.name || user.email}`,
          complaint_id: complaintId,
        },
      ]);
    }
    return NextResponse.json({
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { message: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
