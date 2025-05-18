"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Calendar, Download, FileText, Loader2, PieChart } from "lucide-react"
import ComplaintChart from "@/components/complaint-chart"
import ComplaintPieChart from "@/components/complaint-pie-chart"

const reportSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type",
  }),
  startDate: z.string().min(1, {
    message: "Please select a start date",
  }),
  endDate: z.string().min(1, {
    message: "Please select an end date",
  }),
  category: z.string().optional(),
  department: z.string().optional(),
  format: z.enum(["pdf", "excel", "csv"], {
    required_error: "Please select a format",
  }),
})

const scheduleSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type",
  }),
  frequency: z.string({
    required_error: "Please select a frequency",
  }),
  recipients: z.string().min(5, {
    message: "Please enter at least one recipient email",
  }),
  includeAttachment: z.boolean().default(true),
})

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const reportForm = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "",
      startDate: "",
      endDate: "",
      category: "",
      department: "",
      format: "pdf",
    },
  })

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      reportType: "",
      frequency: "",
      recipients: "",
      includeAttachment: true,
    },
  })

  const onGenerateReport = async (values: z.infer<typeof reportSchema>) => {
    setIsGenerating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Generate report:", values)

    // Mock report data
    const mockData = {
      title: `${values.reportType} Report`,
      period: `${values.startDate} to ${values.endDate}`,
      summary: {
        totalComplaints: 1284,
        resolved: 856,
        pending: 342,
        inProgress: 86,
      },
      categoryData: [
        { name: "Roads", value: 450 },
        { name: "Water", value: 320 },
        { name: "Sanitation", value: 250 },
        { name: "Electricity", value: 180 },
        { name: "Others", value: 84 },
      ],
      monthlyData: [
        { month: "Jan", complaints: 95, resolved: 80 },
        { month: "Feb", complaints: 102, resolved: 85 },
        { month: "Mar", complaints: 120, resolved: 90 },
        { month: "Apr", complaints: 110, resolved: 95 },
        { month: "May", complaints: 125, resolved: 100 },
        { month: "Jun", complaints: 115, resolved: 90 },
      ],
    }

    setReportData(mockData)
    setReportGenerated(true)
    setIsGenerating(false)
  }

  const onScheduleReport = async (values: z.infer<typeof scheduleSchema>) => {
    setIsScheduling(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Schedule report:", values)

    // In a real app, you would schedule the report in the backend

    setIsScheduling(false)
    scheduleForm.reset()
  }

  const downloadReport = () => {
    // In a real app, you would download the report
    console.log("Downloading report...")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MIS Reports</h1>
          <p className="text-muted-foreground">Generate and schedule management information system reports</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Report Parameters</CardTitle>
                <CardDescription>Configure the parameters for your report</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...reportForm}>
                  <form onSubmit={reportForm.handleSubmit(onGenerateReport)} className="space-y-4">
                    <FormField
                      control={reportForm.control}
                      name="reportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly_summary">Monthly Summary</SelectItem>
                              <SelectItem value="category_analysis">Category Analysis</SelectItem>
                              <SelectItem value="resolution_time">Resolution Time Analysis</SelectItem>
                              <SelectItem value="department_performance">Department Performance</SelectItem>
                              <SelectItem value="escalation_report">Escalation Report</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={reportForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reportForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={reportForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="roads">Roads</SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="sanitation">Sanitation</SelectItem>
                              <SelectItem value="electricity">Electricity</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Filter report by specific category</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="All Departments" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              <SelectItem value="roads_dept">Roads Department</SelectItem>
                              <SelectItem value="water_authority">Water Authority</SelectItem>
                              <SelectItem value="sanitation_dept">Sanitation Department</SelectItem>
                              <SelectItem value="electricity_dept">Electricity Department</SelectItem>
                              <SelectItem value="education_dept">Education Department</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Filter report by specific department</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Export Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isGenerating}>
                      {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Report
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Report Preview</CardTitle>
                <CardDescription>
                  {reportGenerated
                    ? `${reportData?.title} (${reportData?.period})`
                    : "Generate a report to see the preview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportGenerated ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Complaints</p>
                        <p className="text-2xl font-bold">{reportData.summary.totalComplaints}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="text-2xl font-bold">{reportData.summary.resolved}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{reportData.summary.pending}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold">{reportData.summary.inProgress}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-2 flex items-center">
                          <BarChart className="h-4 w-4 mr-2" />
                          Monthly Trend
                        </h3>
                        <div className="h-[300px] border rounded-md p-4">
                          <ComplaintChart period="month" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-medium mb-2 flex items-center">
                          <PieChart className="h-4 w-4 mr-2" />
                          Category Distribution
                        </h3>
                        <div className="h-[300px] border rounded-md p-4">
                          <ComplaintPieChart />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Detailed Data
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Month</TableHead>
                              <TableHead>Total Complaints</TableHead>
                              <TableHead>Resolved</TableHead>
                              <TableHead>Resolution Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.monthlyData.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{item.month}</TableCell>
                                <TableCell>{item.complaints}</TableCell>
                                <TableCell>{item.resolved}</TableCell>
                                <TableCell>{Math.round((item.resolved / item.complaints) * 100)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <Button onClick={downloadReport} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Report Generated</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-2">
                      Configure the report parameters and click "Generate Report" to see the preview.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Report</CardTitle>
                <CardDescription>Set up automated reports to be sent periodically</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...scheduleForm}>
                  <form onSubmit={scheduleForm.handleSubmit(onScheduleReport)} className="space-y-4">
                    <FormField
                      control={scheduleForm.control}
                      name="reportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly_summary">Monthly Summary</SelectItem>
                              <SelectItem value="category_analysis">Category Analysis</SelectItem>
                              <SelectItem value="resolution_time">Resolution Time Analysis</SelectItem>
                              <SelectItem value="department_performance">Department Performance</SelectItem>
                              <SelectItem value="escalation_report">Escalation Report</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scheduleForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How often the report should be generated and sent</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scheduleForm.control}
                      name="recipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipients</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email addresses (comma-separated)" {...field} />
                          </FormControl>
                          <FormDescription>Email addresses of people who should receive this report</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scheduleForm.control}
                      name="includeAttachment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include Attachment</FormLabel>
                            <FormDescription>Attach the report as a PDF file to the email</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isScheduling}>
                      {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Schedule Report
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled Reports</CardTitle>
                <CardDescription>View and manage your scheduled reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Summary</TableCell>
                        <TableCell>Monthly</TableCell>
                        <TableCell className="truncate max-w-[150px]">admin@example.com, manager@example.com</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Category Analysis</TableCell>
                        <TableCell>Weekly</TableCell>
                        <TableCell className="truncate max-w-[150px]">reports@example.com</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Department Performance</TableCell>
                        <TableCell>Quarterly</TableCell>
                        <TableCell className="truncate max-w-[150px]">
                          director@example.com, heads@example.com
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <Calendar className="inline-block h-4 w-4 mr-1" />
                  Reports are generated at 00:00 UTC on their scheduled days
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
