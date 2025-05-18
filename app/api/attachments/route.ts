import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: Replace this with your actual Supabase user/session logic
async function getSupabaseUser(request: NextRequest) {
  // Example: get user from cookies or headers if using Supabase Auth
  // For now, return a dummy user for development
  return { id: "dummyUserId" }; // Placeholder, actual implementation needed
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSupabaseUser(request);
    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const complaintId = formData.get("complaintId") as string;
    const files = formData.getAll("files") as File[];

    if (!complaintId) {
      return NextResponse.json(
        { message: "Complaint ID is required" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files provided" },
        { status: 400 }
      );
    }

    // Check if the complaint exists
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from("complaints")
      .select("id")
      .eq("id", complaintId)
      .single();
    if (complaintError || !complaint) {
      return NextResponse.json(
        { message: "Complaint not found or access denied" },
        { status: 404 }
      );
    }

    // Process each file (store metadata only; actual file upload should use Supabase Storage or similar)
    const attachments = [];
    for (const file of files) {
      // TODO: Upload file to Supabase Storage and get the public URL
      // For now, just use a placeholder URL
      const url = `/uploads/${complaintId}/${file.name}`;
      const { data: attachment, error: attachError } = await supabaseAdmin
        .from("attachments")
        .insert([
          {
            name: file.name,
            type: file.type,
            size: file.size,
            url,
            complaint_id: complaintId,
          },
        ])
        .select()
        .single();
      if (attachError) {
        return NextResponse.json(
          { message: "Failed to save attachment metadata" },
          { status: 500 }
        );
      }
      attachments.push(attachment);
    }

    return NextResponse.json({
      message: "Attachments uploaded successfully",
      attachments,
    });
  } catch (error) {
    console.error("Error uploading attachments:", error);
    return NextResponse.json(
      { message: "Failed to upload attachments" },
      { status: 500 }
    );
  }
}
