import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, FileText, UserPlus, LogIn } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-16">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Unified Complaint Management System
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A platform for citizens to lodge and track complaints with the Collectorate
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                <UserPlus className="h-5 w-5" />
                Register
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/login">
                <LogIn className="h-5 w-5" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lodge a Complaint</CardTitle>
              <CardDescription>Submit your grievances directly to the concerned department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Easily file complaints with detailed descriptions, location information, and supporting evidence.</p>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/login">
                  <FileText className="h-4 w-4" />
                  Lodge Complaint
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Track Complaints</CardTitle>
              <CardDescription>Monitor the status of your submitted complaints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Check the current status, view official responses, and receive updates on your complaints.</p>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/login">
                  Track Status
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Official Portal</CardTitle>
              <CardDescription>For government officials to manage complaints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Authorized officials can review, respond to, and resolve citizen complaints through a dedicated
                interface.
              </p>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/login">
                  Official Login
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
