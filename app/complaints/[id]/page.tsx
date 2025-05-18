"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Type definitions
interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  by: string;
}

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

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "In Progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Resolved":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Escalated":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default function ComplaintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
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
            <h3 className="text-lg font-medium">Complaint Not Found</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              {error ||
                "The complaint you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <Button asChild>
              <Link href="/complaints">Back to Complaints</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/complaints">My Complaints</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>{params.id}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Complaint Details
          </h1>
          <p className="text-muted-foreground">
            View detailed information about your complaint
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/complaints">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Complaints
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <CardTitle className="text-xl">{complaint.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                Complaint ID:{" "}
                <span className="font-medium ml-1">{complaint.id}</span>
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(
                complaint.status
              )} text-sm px-3 py-1`}
            >
              {complaint.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                    {complaint.subcategory && `> ${complaint.subcategory}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Update</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.timeline.length > 0
                      ? `${new Date(
                          complaint.timeline[0].date
                        ).toLocaleDateString()} - ${
                          complaint.timeline[0].description
                        }`
                      : "No updates yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{complaint.description}</p>

              <div className="mt-6">
                <h3 className="text-base font-medium mb-2">Location Details</h3>
                <div className="h-[300px] w-full rounded-md border overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="font-medium">Map Placeholder</p>
                    <p className="text-sm text-muted-foreground">
                      Location: {complaint.latitude}, {complaint.longitude}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
              <CardDescription>
                Files and images attached to this complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complaint.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <div className="aspect-video relative bg-gray-100">
                        <Image
                          src={`/placeholder.svg?height=200&width=400&text=${attachment.name}`}
                          alt={attachment.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-medium truncate">
                          {attachment.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No attachments for this complaint
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Timeline</CardTitle>
              <CardDescription>
                History of actions and updates for this complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l">
                {complaint.timeline.map((event) => (
                  <div key={event.id} className="mb-6 relative">
                    <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full border border-primary bg-background"></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        By: {event.by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
