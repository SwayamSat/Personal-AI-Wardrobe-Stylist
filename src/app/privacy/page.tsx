'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Database, Lock, Users, AlertCircle, CheckCircle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          
          <p className="text-muted-foreground text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Privacy Matters</h3>
                <p className="text-muted-foreground text-sm">
                  We are committed to protecting your privacy and being transparent about how we collect, 
                  use, and protect your personal information when you use WardrobeAI.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-3 text-primary" />
              1. Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Account Information:</strong> Email address, name (if provided)</li>
                  <li><strong className="text-foreground">Profile Data:</strong> User preferences, styling preferences</li>
                  <li><strong className="text-foreground">Authentication Data:</strong> Login credentials (handled securely)</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Content You Upload</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Clothing Photos:</strong> Images of your clothing items</li>
                  <li><strong className="text-foreground">Metadata:</strong> File information, upload timestamps</li>
                  <li><strong className="text-foreground">Categorization:</strong> Clothing categories and tags you assign</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">App Usage:</strong> Features used, time spent, interactions</li>
                  <li><strong className="text-foreground">Device Information:</strong> Device type, browser, operating system</li>
                  <li><strong className="text-foreground">Technical Data:</strong> IP address, session information</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Database className="h-6 w-6 mr-3 text-primary" />
              2. How We Use Your Information
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">AI Processing</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Analyze clothing items to identify colors, materials, and styles</li>
                  <li>Generate personalized outfit recommendations</li>
                  <li>Provide styling tips and fashion advice</li>
                  <li>Improve our AI algorithms and service quality</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Service Provision</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Create and maintain your account</li>
                  <li>Store your wardrobe data and preferences</li>
                  <li>Provide customer support</li>
                  <li>Send important service notifications</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Service Improvement</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Analyze usage patterns to improve features</li>
                  <li>Develop new AI capabilities</li>
                  <li>Fix bugs and technical issues</li>
                  <li>Conduct research and development</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Lock className="h-6 w-6 mr-3 text-primary" />
              3. Data Security and Protection
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Security Measures</h3>
                <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
                  <li><strong className="text-green-800 dark:text-green-200">Encryption:</strong> All data is encrypted in transit and at rest</li>
                  <li><strong className="text-green-800 dark:text-green-200">Secure Storage:</strong> Data stored on secure, encrypted servers</li>
                  <li><strong className="text-green-800 dark:text-green-200">Access Controls:</strong> Strict access controls and authentication</li>
                  <li><strong className="text-green-800 dark:text-green-200">Regular Audits:</strong> Security audits and vulnerability assessments</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Third-Party Services</h3>
                <p className="mb-3">
                  We use trusted third-party services to provide our AI capabilities:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Google Gemini AI:</strong> For clothing analysis and outfit recommendations</li>
                  <li><strong className="text-foreground">Supabase:</strong> For database and authentication services</li>
                  <li><strong className="text-foreground">Vercel:</strong> For hosting and deployment</li>
                </ul>
                <p className="mt-3 text-sm">
                  All third-party services are carefully vetted and comply with industry security standards.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              4. Your Rights and Choices
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Data Access and Control</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">View Your Data:</strong> Access all personal information we have about you</li>
                  <li><strong className="text-foreground">Update Information:</strong> Correct or update your account information</li>
                  <li><strong className="text-foreground">Delete Account:</strong> Request complete deletion of your account and data</li>
                  <li><strong className="text-foreground">Data Export:</strong> Request a copy of your data in a portable format</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Communication Preferences</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Opt out of non-essential communications</li>
                  <li>Choose how you receive notifications</li>
                  <li>Update your communication preferences at any time</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Account Data:</strong> We retain your account information for as long as your account is active 
                  or as needed to provide services to you.
                </p>
                <p>
                  <strong className="text-foreground">Uploaded Content:</strong> Your clothing photos and wardrobe data are stored until you delete 
                  them or close your account.
                </p>
                <p>
                  <strong className="text-foreground">Usage Data:</strong> We may retain usage analytics for up to 2 years to improve our service.
                </p>
                <p>
                  <strong className="text-foreground">Deletion:</strong> When you delete your account, we will delete your personal data within 
                  30 days, except where we are required to retain it for legal or regulatory purposes.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our service</li>
                <li>Improve our website performance</li>
                <li>Provide personalized experiences</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences. Note that disabling cookies 
                may affect some functionality of our service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">
                    WardrobeAI is not intended for children under 13 years of age. We do not knowingly collect 
                    personal information from children under 13. If you are a parent or guardian and believe your 
                    child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. International Users</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                If you are accessing WardrobeAI from outside the United States, please be aware that your 
                information may be transferred to, stored, and processed in the United States where our 
                servers are located.
              </p>
              <p>
                For users in the European Union, we comply with GDPR requirements. For users in California, 
                we comply with CCPA requirements.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
              you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
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
    </div>
  )
}
