"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, X } from "lucide-react"

// Mock data for complaints
const mockComplaints = [
  {
    id: "CMP-123456",
    title: "Pothole on Main Road",
    citizen: "Rahul Sharma",
    category: "Roads",
    date: "2023-05-01",
    status: "Pending",
    escalation: "None",
    assignedTo: "Dept. of Roads",
  },
  {
    id: "CMP-123457",
    title: "Water Supply Disruption",
    citizen: "Priya Patel",
    category: "Water",
    date: "2023-05-05",
    status: "In Progress",
    escalation: "None",
    assignedTo: "Water Authority",
  },
  {
    id: "CMP-123458",
    title: "Street Light Not Working",
    citizen: "Amit Kumar",
    category: "Electricity",
    date: "2023-05-10",
    status: "Resolved",
    escalation: "None",
    assignedTo: "Electricity Dept.",
  },
  {
    id: "CMP-123459",
    title: "Garbage Not Collected",
    citizen: "Neha Singh",
    category: "Sanitation",
    date: "2023-05-15",
    status: "Escalated",
    escalation: "Level 1",
    assignedTo: "Sanitation Dept.",
  },
  {
    id: "CMP-123460",
    title: "Damaged Footpath",
    citizen: "Vikram Desai",
    category: "Roads",
    date: "2023-05-20",
    status: "Pending",
    escalation: "None",
    assignedTo: "Unassigned",
  },
  {
    id: "CMP-123461",
    title: "Sewage Overflow",
    citizen: "Meera Joshi",
    category: "Sanitation",
    date: "2023-05-22",
    status: "In Progress",
    escalation: "None",
    assignedTo: "Sanitation Dept.",
  },
  {
    id: "CMP-123462",
    title: "School Building Repair",
    citizen: "Rajesh Gupta",
    category: "Education",
    date: "2023-05-25",
    status: "Pending",
    escalation: "None",
    assignedTo: "Education Dept.",
  },
]

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "In Progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "Resolved":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "Escalated":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export default function ComplaintManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [escalationFilter, setEscalationFilter] = useState("")
  const [assignedFilter, setAssignedFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Filter complaints based on search and filters
  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesSearch =
      searchTerm === "" ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.citizen.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "" || complaint.status === statusFilter

    const matchesCategory = categoryFilter === "" || complaint.category === categoryFilter

    const matchesEscalation = escalationFilter === "" || complaint.escalation === escalationFilter

    const matchesAssigned = assignedFilter === "" || complaint.assignedTo === assignedFilter

    const matchesDate = dateFilter === "" || complaint.date === dateFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesEscalation && matchesAssigned && matchesDate
  })

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setCategoryFilter("")
    setEscalationFilter("")
    setAssignedFilter("")
    setDateFilter("")
  }

  const hasActiveFilters =
    searchTerm || statusFilter || categoryFilter || escalationFilter || assignedFilter || dateFilter

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaint Management</h1>
          <p className="text-muted-foreground">View, assign, and resolve citizen complaints</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/reports">Generate Reports</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>Find specific complaints by ID, title, status, or other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, title, or citizen..."
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
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={escalationFilter} onValueChange={setEscalationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Escalation Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Level 1">Level 1</SelectItem>
                <SelectItem value="Level 2">Level 2</SelectItem>
                <SelectItem value="Level 3">Level 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                <SelectItem value="Dept. of Roads">Dept. of Roads</SelectItem>
                <SelectItem value="Water Authority">Water Authority</SelectItem>
                <SelectItem value="Electricity Dept.">Electricity Dept.</SelectItem>
                <SelectItem value="Sanitation Dept.">Sanitation Dept.</SelectItem>
                <SelectItem value="Education Dept.">Education Dept.</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>

          {hasActiveFilters && (
            <div className="flex items-center mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Clear Filters</span>
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="ml-2 text-sm text-muted-foreground">{filteredComplaints.length} results found</div>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredComplaints.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Complaint ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Citizen</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date Filed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Escalation</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">
                    <Link href={`/complaints/manage/${complaint.id}`} className="text-primary hover:underline">
                      {complaint.id}
                    </Link>
                  </TableCell>
                  <TableCell>{complaint.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{complaint.citizen}</TableCell>
                  <TableCell className="hidden md:table-cell">{complaint.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(complaint.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{complaint.escalation}</TableCell>
                  <TableCell className="hidden lg:table-cell">{complaint.assignedTo}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/complaints/manage/${complaint.id}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">No complaints found</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              {hasActiveFilters
                ? "No complaints match your current filters. Try adjusting your search criteria."
                : "There are no complaints in the system yet."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
