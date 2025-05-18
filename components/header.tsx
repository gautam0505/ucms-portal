"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch notification count (mock for now)
  useEffect(() => {
    if (user && user.role === "citizen") {
      // This would be a real API call in production
      setNotificationCount(3);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const NavLinks = () => (
    <>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      {user && user.role === "citizen" && (
        <>
          <Link
            href="/complaints/new"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/complaints/new"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Lodge Complaint
          </Link>
          <Link
            href="/complaints"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/complaints"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            My Complaints
          </Link>
          <Link
            href="/notifications"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/notifications"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Notifications
          </Link>
        </>
      )}
      {user && (user.role === "official" || user.role === "admin") && (
        <>
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/complaints/manage"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/complaints/manage"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Manage Complaints
          </Link>
          <Link
            href="/reports"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/reports" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Reports
          </Link>
          {user.role === "admin" && (
            <Link
              href="/users"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/users" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Users
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="UCMS Logo"
              className="rounded"
            />
            <span className="font-bold text-lg hidden sm:inline-block">
              UCMS Portal
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "citizen" && notificationCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User menu"
                    className="rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {user.user_metadata.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.user_metadata.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
