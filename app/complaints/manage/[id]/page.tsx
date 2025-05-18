"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, Loader2, MapPin, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Form schema for status update
const statusUpdateSchema = z.object({
  status: z.string({
    required_error: "Please select a status",
  }),
  remarks: z
    .string()
    .min(5, {
      message: "Remarks must be at least 5 characters",
    })
    .max(500, {
      message: "Remarks must not exceed 500 characters",
    }),
});

// Form schema for adding a comment
const commentSchema = z.object({
  comment: z
    .string()
    .min(5, {
      message: "Comment must be at least 5 characters",
    })
    .max(500, {
      message: "Comment must not exceed 500 characters",
    }),
  visibility: z.enum(["public", "internal"], {
    required_error: "Please select visibility",
  }),
});

// Form schema for escalation
const escalationSchema = z.object({
  level: z.string({
    required_error: "Please select an escalation level",
  }),
  department: z.string({
    required_error: "Please select a department",
  }),
  reason: z
    .string()
    .min(10, {
      message: "Reason must be at least 10 characters",
    })
    .max(500, {
      message: "Reason must not exceed 500 characters",
    }),
});

interface ComplaintDetail {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  date: string;
  status: string;
  address: string;
  latitude: string;
  longitude: string;
  attachments: Attachment[];
  timeline: TimelineEvent[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
    mobile: string | null;
  };
  assignedTo: string | null;
  escalation: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface TimelineEvent {
  id: string;
  action: string;
  description: string;
  by: string;
  date: string;
}

export default function ComplaintManagementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // Status update form
  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "",
      remarks: "",
    },
  });

  // Comment form
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
      visibility: "public",
    },
  });

  // Escalation form
  const escalationForm = useForm<z.infer<typeof escalationSchema>>({
    resolver: zodResolver(escalationSchema),
    defaultValues: {
      level: "Level 1",
      department: "",
      reason: "",
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/complaints/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Complaint not found");
          } else {
            throw new Error("Failed to fetch complaint details");
          }
        }

        const data = await response.json();
        setComplaint({
          ...data,
          date: data.createdAt,
          timeline: data.timeline.map((item: any) => ({
            ...item,
            date: item.createdAt,
          })),
        });
      } catch (error) {
        console.error("Error fetching complaint details:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load complaint details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [params.id]);

  const onStatusUpdate = async (values: z.infer<typeof statusUpdateSchema>) => {
    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/complaints/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });

      // Refresh complaint details
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const onAddComment = async (values: z.infer<typeof commentSchema>) => {
    try {
      setIsAddingComment(true);
      const response = await fetch(`/api/complaints/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      // Refresh complaint details
      router.refresh();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const onEscalate = async (values: z.infer<typeof escalationSchema>) => {
    try {
      setIsEscalating(true);
      const response = await fetch(`/api/complaints/${params.id}/escalate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to escalate complaint");
      }

      toast({
        title: "Success",
        description: "Complaint escalated successfully",
      });

      // Refresh complaint details
      router.refresh();
    } catch (error) {
      console.error("Error escalating complaint:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to escalate complaint",
        variant: "destructive",
      });
    } finally {
      setIsEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Error</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {error || "Failed to load complaint details"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manage Complaint
          </h1>
          <p className="text-muted-foreground">
            View and manage complaint details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Citizen</p>
                          <p className="text-sm">{complaint.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.user.email} | {complaint.user.mobile}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Date Filed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(complaint.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Time Filed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(complaint.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">
                            {complaint.category}{" "}
                            {complaint.subcategory &&
                              `> ${complaint.subcategory}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          variant="outline"
                          className={getStatusColor(complaint.status)}
                        >
                          {complaint.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Escalation</p>
                        <Badge
                          variant="outline"
                          className={
                            complaint.escalation !== "None"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        >
                          {complaint.escalation}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Assigned To</p>
                        <p className="text-sm text-muted-foreground">
                          {complaint.assignedTo || "Unassigned"}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {complaint.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...statusForm}>
                    <form
                      onSubmit={statusForm.handleSubmit(onStatusUpdate)}
                      className="space-y-4"
                    >
                      <FormField
                        control={statusForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="Escalated">
                                  Escalated
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={statusForm.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add remarks about the status update..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isUpdatingStatus}>
                        {isUpdatingStatus && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Status
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...commentForm}>
                    <form
                      onSubmit={commentForm.handleSubmit(onAddComment)}
                      className="space-y-4"
                    >
                      <FormField
                        control={commentForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add your comment..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={commentForm.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="internal">
                                  Internal
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Public comments are visible to the citizen, while
                              internal comments are only visible to officials.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isAddingComment}>
                        {isAddingComment && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add Comment
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Escalate Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...escalationForm}>
                    <form
                      onSubmit={escalationForm.handleSubmit(onEscalate)}
                      className="space-y-4"
                    >
                      <FormField
                        control={escalationForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Escalation Level</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Level 1">Level 1</SelectItem>
                                <SelectItem value="Level 2">Level 2</SelectItem>
                                <SelectItem value="Level 3">Level 3</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={escalationForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="roads">
                                  Roads Department
                                </SelectItem>
                                <SelectItem value="water">
                                  Water Department
                                </SelectItem>
                                <SelectItem value="sanitation">
                                  Sanitation Department
                                </SelectItem>
                                <SelectItem value="electricity">
                                  Electricity Department
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={escalationForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason for Escalation</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain why this complaint needs to be escalated..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isEscalating}>
                        {isEscalating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Escalate Complaint
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {complaint.timeline.map((event) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-0.5 h-full bg-border" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {event.by}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  {complaint.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaint.attachments.map((attachment) => (
                        <Card key={attachment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="rounded-lg bg-muted p-2">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(attachment.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No attachments found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                Assign to Official
              </Button>
              <Button className="w-full" variant="outline">
                Download Report
              </Button>
              <Button className="w-full" variant="outline">
                Share Complaint
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Time Since Filing</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(
                      (Date.now() - new Date(complaint.date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timeline Events</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.timeline.length} events
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Attachments</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.attachments.length} files
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
