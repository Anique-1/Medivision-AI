import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MediVision AI</h3>
            <p className="text-foreground/60 text-sm">
              Advanced AI-powered medical image analysis for precise diagnostics.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/models" className="text-foreground/60 hover:text-foreground">
                  Models
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-foreground/60 hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-foreground/60 hover:text-foreground">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-foreground/60 hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-foreground/60 hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/60 hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow</h4>
            <div className="flex gap-4">
              <a href="#" className="text-foreground/60 hover:text-foreground">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-foreground/60 text-sm">© 2025 MediVision AI by TechNova. All rights reserved.</p>
          <div className="flex gap-6 text-sm mt-4 md:mt-0">
            <Link href="/privacy" className="text-foreground/60 hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-foreground/60 hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
