"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import ComplaintChart from "@/components/complaint-chart";
import ComplaintPieChart from "@/components/complaint-pie-chart";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
  recentComplaints: {
    id: string;
    title: string;
    category: string;
    createdAt: string;
  }[];
  overdueComplaints: {
    id: string;
    title: string;
    category: string;
    daysOverdue: number;
  }[];
  activeUsers: {
    id: string;
    name: string;
    complaintCount: number;
  }[];
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState("week");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard?period=${period}`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [period]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Failed to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              There was an error loading the dashboard statistics. Please try
              again later.
            </p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of complaint statistics and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/complaints/manage">
              <FileText className="mr-2 h-4 w-4" />
              Manage Complaints
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Reports
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Complaints
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Complaints
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">-4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Complaints
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedComplaints}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Escalated Complaints
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.escalatedComplaints}
            </div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Complaint Trends</CardTitle>
              <Tabs
                defaultValue="week"
                value={period}
                onValueChange={setPeriod}
              >
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              Number of complaints lodged over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ComplaintChart period={period} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
            <CardDescription>
              Distribution of complaints across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintPieChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>
              Latest complaints requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      <Link
                        href={`/complaints/manage/${complaint.id}`}
                        className="hover:underline"
                      >
                        {complaint.title}
                      </Link>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{complaint.id}</span>
                      <span>•</span>
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span>
                        {new Date(complaint.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/complaints/manage/${complaint.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/complaints/manage">View All Complaints</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Complaints</CardTitle>
            <CardDescription>
              Complaints that require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.overdueComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-red-200 bg-red-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      <Link
                        href={`/complaints/manage/${complaint.id}`}
                        className="hover:underline"
                      >
                        {complaint.title}
                      </Link>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{complaint.id}</span>
                      <span>•</span>
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span className="text-red-600 font-medium">
                        Overdue by {complaint.daysOverdue} days
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" asChild>
                    <Link href={`/complaints/manage/${complaint.id}`}>
                      Resolve
                    </Link>
                  </Button>
                </div>
              ))}
              {stats.overdueComplaints.length === 0 && (
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-center text-muted-foreground">
                    No overdue complaints
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>
              Officials currently managing complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Handling {user.complaintCount} complaints
                    </p>
                  </div>
                </div>
              ))}
              {stats.activeUsers.length === 0 && (
                <div className="col-span-4 p-3 rounded-lg border">
                  <p className="text-sm text-center text-muted-foreground">
                    No active users
                  </p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
