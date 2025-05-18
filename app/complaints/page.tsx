"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Loader2, Search, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Type for complaint data
interface Complaint {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  escalation: string;
  assignedTo: string | null;
  citizen: {
    name: string | null;
    email: string | null;
    mobile: string | null;
  };
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

export default function ComplaintsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const isOfficial = user?.role === "official" || user?.role === "admin";

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // Get Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(
          `/api/complaints?page=${currentPage}&status=${
            statusFilter === "all" ? "" : statusFilter
          }&category=${
            categoryFilter === "all" ? "" : categoryFilter
          }&date=${dateFilter}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const data = await response.json();
        setComplaints(data.complaints);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast({
          title: "Error",
          description: "Failed to load complaints. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is loaded and authenticated
    if (user) {
      fetchComplaints();
    }
    // eslint-disable-next-line
  }, [user, currentPage, statusFilter, categoryFilter, dateFilter, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchTerm || statusFilter || categoryFilter || dateFilter;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isOfficial ? "All Complaints" : "My Complaints"}
          </h1>
          <p className="text-muted-foreground">
            {isOfficial
              ? "View and manage all complaints in the system"
              : "View and track all your submitted complaints"}
          </p>
        </div>
        <Button asChild>
          <Link href="/complaints/new">
            <FileText className="mr-2 h-4 w-4" />
            Lodge New Complaint
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>
            Find specific complaints by ID, title, status, or date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or title..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Roads">Roads</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
                <SelectItem value="Electricity">Electricity</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 gap-1"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Clear Filters</span>
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="ml-2 text-sm text-muted-foreground">
                {complaints.length} results found
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : complaints.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Complaint ID</TableHead>
                <TableHead>Title</TableHead>
                {isOfficial && <TableHead>Citizen</TableHead>}
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">
                  Date Filed
                </TableHead>
                <TableHead>Status</TableHead>
                {isOfficial && (
                  <>
                    <TableHead className="hidden lg:table-cell">
                      Escalation
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Assigned To
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={
                        isOfficial
                          ? `/complaints/manage/${complaint.id}`
                          : `/complaints/${complaint.id}`
                      }
                      className="text-primary hover:underline"
                    >
                      {complaint.id}
                    </Link>
                  </TableCell>
                  <TableCell>{complaint.title}</TableCell>
                  {isOfficial && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {complaint.citizen.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {complaint.citizen.email}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">
                    {complaint.category}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(complaint.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(complaint.status)}
                    >
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  {isOfficial && (
                    <>
                      <TableCell className="hidden lg:table-cell">
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
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {complaint.assignedTo || "Unassigned"}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No complaints found</p>
        </div>
      )}
    </div>
  );
}
