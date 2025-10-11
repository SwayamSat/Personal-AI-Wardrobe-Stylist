'use client'

import Link from 'next/link'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8">
        <div className="flex flex-col xs:flex-row justify-between items-center space-y-4 xs:space-y-0">
          {/* Brand Section */}
          <div className="flex flex-col xs:flex-row items-center space-y-2 xs:space-y-0 xs:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm xs:text-base font-semibold text-foreground">WardrobeAI</span>
            </div>
            <p className="text-xs xs:text-sm text-muted-foreground text-center xs:text-left">
              Made by Swayam Satpathy
            </p>
          </div>

          {/* Contact Links */}
          <div className="flex items-center space-x-3 xs:space-x-4">
            <Link
              href="https://www.linkedin.com/in/swayamsatpathy/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-1 xs:space-x-2 px-2 xs:px-3 py-1.5 xs:py-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 active:scale-95 touch-manipulation"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4 xs:h-5 xs:w-5" />
              <span className="text-xs xs:text-sm font-medium">LinkedIn</span>
            </Link>

            <Link
              href="https://github.com/SwayamSat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-1 xs:space-x-2 px-2 xs:px-3 py-1.5 xs:py-2 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 active:scale-95 touch-manipulation"
              aria-label="GitHub Profile"
            >
              <Github className="h-4 w-4 xs:h-5 xs:w-5" />
              <span className="text-xs xs:text-sm font-medium">GitHub</span>
            </Link>

            <Link
              href="mailto:swayam.satpathy24@gmail.com"
              className="group flex items-center space-x-1 xs:space-x-2 px-2 xs:px-3 py-1.5 xs:py-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-300 active:scale-95 touch-manipulation"
              aria-label="Email Contact"
            >
              <Mail className="h-4 w-4 xs:h-5 xs:w-5" />
              <span className="text-xs xs:text-sm font-medium">Email</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 xs:mt-6 pt-4 xs:pt-6 border-t border-border">
          <div className="flex flex-col xs:flex-row justify-between items-center space-y-2 xs:space-y-0">
            <p className="text-xs text-muted-foreground text-center xs:text-left">
              © 2025 WardrobeAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
