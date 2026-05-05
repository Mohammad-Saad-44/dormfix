import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Wrench,
  ClipboardList,
  Bell,
  Clock,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-white/98 dark:bg-gray-900/98 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DormFix</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">GIKI Maintenance System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" onClick={onSignIn} className="glass-button">
                Sign In
              </Button>
              <Button onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by GIKI Community
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Streamline Hostel Maintenance at{' '}
              <span className="text-blue-600 dark:text-blue-400">GIKI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              No more endless follow-ups or wondering when your issue will be fixed.
              Report problems instantly and watch them get resolved in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onSignUp}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-lg px-8 py-6"
              >
                Create Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onSignIn}
                className="glass-button text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-3xl transform rotate-3 z-0"></div>
            <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8 transform -rotate-1 z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 glass-stat border-blue-300 dark:border-blue-700 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Submit Complaint</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quick and easy reporting</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-4 p-4 glass-stat border-purple-300 dark:border-purple-700 rounded-xl">
                  <div className="w-12 h-12 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Assign Technician</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatic task routing</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-4 p-4 glass-stat border-green-300 dark:border-green-700 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Get Updates</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time notifications</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why Students Love DormFix
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Maintenance made simple, fast, and transparent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-card shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Report issues in under 30 seconds. No paperwork, no waiting in line at the office. Just open, type, and submit.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Always in the Loop
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Track your complaint from the moment you submit it until it's resolved. No more wondering "did they see it?"
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                24/7 Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Submit complaints anytime, anywhere. Round-the-clock access means help is always available when you need it.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Simple process, powerful results</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Sign Up</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Register with your GIKI email address
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Get Verified</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Verify your GIKI email with OTP
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Report Issues</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Submit maintenance complaints easily
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              4
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Get Fixed</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track progress until resolution
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            What GIKI Students Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Hear from the community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-card shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Finally! No more running to the hostel office. I submitted my internet complaint at 10 PM and it was fixed the next morning. Game changer."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Ali Raza</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CS Student</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "I love that I can see exactly where my complaint is. No more 'we'll look into it' responses. Everything is transparent now."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Bilal Khan</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">EE Student</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "The old system was chaos. Now I can report issues from my phone and actually get updates. Saved me so many trips to the office."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Ahmed Hassan</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">ME Student</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="glass-card bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 border-0 shadow-2xl">
          <CardContent className="p-16 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-10 max-w-2xl mx-auto">
              Join hundreds of GIKI students using DormFix for hassle-free hostel maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onSignUp}
                className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:hover:bg-white text-lg px-8 py-6"
              >
                Create Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">DormFix</h3>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <button onClick={onSignIn} className="hover:text-blue-600 dark:hover:text-blue-400">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={onSignUp} className="hover:text-blue-600 dark:hover:text-blue-400">
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>GIKI Campus</li>
                <li>Topi, KPK, Pakistan</li>
                <li>Phone: +92-938-281026</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 DormFix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
