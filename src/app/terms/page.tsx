'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Users, FileText, AlertTriangle } from 'lucide-react'
import PageAnimation from '@/components/PageAnimation'

export default function TermsPage() {
  return (
    <PageAnimation className="min-h-screen text-foreground relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Terms and Conditions</h1>
          </div>
          
          <p className="text-muted-foreground text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Important Notice</h3>
                <p className="text-muted-foreground text-sm">
                  Please read these Terms and Conditions carefully before using WardrobeAI. By using our service, 
                  you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using WardrobeAI ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              2. Service Description
            </h2>
            <p className="text-muted-foreground mb-4">
              WardrobeAI is an AI-powered wardrobe styling service that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Analyzes clothing items from uploaded photos using artificial intelligence</li>
              <li>Provides personalized outfit recommendations based on your wardrobe</li>
              <li>Offers styling tips and fashion advice</li>
              <li>Helps organize and categorize your clothing items</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts and Registration</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                To use certain features of the Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Content and Intellectual Property</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Your Content:</strong> You retain ownership of all photos and content you upload to the Service. 
                By uploading content, you grant us a limited license to use, process, and analyze your content solely 
                to provide the Service to you.
              </p>
              <p>
                <strong className="text-foreground">AI Recommendations:</strong> Outfit recommendations and styling advice generated by our AI 
                are provided for informational purposes only. We do not guarantee the accuracy or suitability of 
                these recommendations.
              </p>
              <p>
                <strong className="text-foreground">Service Content:</strong> All content, features, and functionality of the Service are owned 
                by WardrobeAI and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Acceptable Use</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Upload inappropriate, offensive, or illegal content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service for commercial purposes without permission</li>
                <li>Upload content that violates intellectual property rights</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Privacy and Data Protection</h2>
            <p className="text-muted-foreground mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
              of the Service, to understand our practices regarding the collection and use of your information.
            </p>
            <Link 
              href="/privacy" 
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              View Privacy Policy
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Disclaimers and Limitations</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Service Availability:</strong> We strive to maintain the Service's availability but do not 
                guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance or technical issues.
              </p>
              <p>
                <strong className="text-foreground">AI Accuracy:</strong> While we use advanced AI technology, we cannot guarantee the accuracy 
                of clothing analysis or outfit recommendations. Use our suggestions as guidance, not absolute rules.
              </p>
              <p>
                <strong className="text-foreground">Limitation of Liability:</strong> To the maximum extent permitted by law, WardrobeAI shall not 
                be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, 
              for any reason, including breach of these Terms. You may also terminate your account at any time 
              by contacting us or using the account deletion feature.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes 
              via email or through the Service. Your continued use of the Service after such modifications constitutes 
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong className="text-foreground">Email:</strong> swayam.satpathy24@gmail.com</p>
                <p><strong className="text-foreground">Developer:</strong> Swayam Satpathy</p>
                <div className="flex space-x-4 mt-4">
                  <a 
                    href="https://www.linkedin.com/in/swayamsatpathy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a 
                    href="https://github.com/SwayamSat" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageAnimation>
  )
}
