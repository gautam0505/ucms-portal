import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Unified Complaint Management System
          </p>
          <p className="text-xs text-muted-foreground">Government of India</p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/accessibility" className="hover:underline">
            Accessibility
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Use
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  )
}
