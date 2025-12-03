#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, '../app/(site)/vendor/dashboard/page.tsx');

// Read the current file
const content = fs.readFileSync(dashboardPath, 'utf-8');

// Step 1: Update imports
const updatedImports = content.replace(
  `import {
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';`,
  `import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Zap,
  FileText,
  Bell,
} from 'lucide-react';`
);

// Step 2: Replace Profile Status Card with redesigned version
const profileCardStart = updatedImports.indexOf('      {/* Profile Status Card */}');
const profileCardEnd = updatedImports.indexOf('      {/* Additional Information Section */}');
const profileCardContent = updatedImports.substring(profileCardStart, profileCardEnd);

const newProfileCard = `      {/* Profile Status Card - Redesigned with Better Visual Hierarchy */}
      <Card className="overflow-hidden border-0 shadow-md dark:shadow-xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-slate-800 dark:to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl">Profile Status</CardTitle>
                <CardDescription>Your account information and completion</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Profile Completion Section with Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground dark:text-white">Profile Completion</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {profileCompletion}%
              </span>
            </div>
            {/* Prominent Gradient Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg"
                style={{ width: \`\${profileCompletion}%\` }}
                role="progressbar"
                aria-valuenow={profileCompletion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={\`Profile completion: \${profileCompletion} percent\`}
              />
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              {100 - profileCompletion}% remaining to complete your profile
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border dark:border-slate-700" />

          {/* Approval Status Section with Status Indicator */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground dark:text-white">Approval Status</p>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-sm text-muted-foreground dark:text-muted-foreground">Account Status</span>
              {approvalStatus === 'approved' ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                  Approved
                </span>
              ) : approvalStatus === 'pending' ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full animate-pulse" />
                  Pending Review
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full" />
                  Rejected
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      `;

const updatedContent1 = updatedImports.substring(0, profileCardStart) + newProfileCard + updatedImports.substring(profileCardEnd);

// Step 3: Replace Getting Started Card
const gettingStartedStart = updatedContent1.indexOf('      {/* Additional Information Section */}');
const gettingStartedEnd = updatedContent1.indexOf('            </div>');
const gettingStartedContent = updatedContent1.substring(gettingStartedStart, gettingStartedEnd);

const newGettingStarted = `      {/* Getting Started Card - Redesigned with Interactive Step Cards */}
      <Card className="overflow-hidden border-0 shadow-md dark:shadow-xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl">Getting Started</CardTitle>
              <CardDescription>Quick onboarding steps to unlock all features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Interactive Step Cards with Hover Effects */}
          <div className="space-y-3">
            {/* Step 1: Complete Profile */}
            <div className="group cursor-pointer">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground dark:text-white text-sm">Complete your profile</h3>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                      Add company information, logo, and contact details
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Step 2: Add Products (Tier 2+ only) */}
            {tier === 'tier2' && (
              <div className="group cursor-pointer">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground dark:text-white text-sm">Add your products</h3>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                        Showcase your products to potential customers
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-0.5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Configure Notifications */}
            <div className="group cursor-pointer">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <Bell className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground dark:text-white text-sm">Configure notifications</h3>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                      Manage your email preferences and alerts
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-0.5" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      `;

const finalContent = updatedContent1.substring(0, gettingStartedStart) + newGettingStarted + updatedContent1.substring(gettingStartedEnd);

// Write the updated file
fs.writeFileSync(dashboardPath, finalContent, 'utf-8');

console.log('Dashboard redesign completed successfully!');
console.log('Updated file:', dashboardPath);
