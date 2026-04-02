import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomerBanner from "./components/CustomerBanner";
import Link from "next/link";
import { ThemeProvider } from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import MobileNavbar from "./components/MobileNavbar";
import { 
  Building2, 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  ShieldAlert, 
  Activity 
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ML Deployment Web App",
  description: "Shop App with ML prioritization",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CustomerBanner />
          
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center space-x-6">
                  <Link href="/" className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-br from-cerulean-600 to-cerulean-400 bg-clip-text text-transparent flex-shrink-0 group">
                    <Building2 className="w-6 h-6 text-cerulean-500 group-hover:rotate-6 transition-transform" />
                    <span>ShopOps</span>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-1">
                    <Link href="/dashboard" className="flex items-center space-x-1.5 text-foreground/70 hover:text-cerulean-500 hover:bg-cerulean-50/50 dark:hover:bg-cerulean-900/20 px-3 py-2 rounded-lg font-medium transition-colors duration-200">
                      <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
                    </Link>
                    <Link href="/place-order" className="flex items-center space-x-1.5 text-foreground/70 hover:text-cerulean-500 hover:bg-cerulean-50/50 dark:hover:bg-cerulean-900/20 px-3 py-2 rounded-lg font-medium transition-colors duration-200">
                      <ShoppingCart className="w-4 h-4" /> <span>Order</span>
                    </Link>
                    <Link href="/orders" className="flex items-center space-x-1.5 text-foreground/70 hover:text-cerulean-500 hover:bg-cerulean-50/50 dark:hover:bg-cerulean-900/20 px-3 py-2 rounded-lg font-medium transition-colors duration-200">
                      <Clock className="w-4 h-4" /> <span>History</span>
                    </Link>
                    
                    <div className="h-4 w-px bg-border mx-2"></div>
                    
                    <Link href="/warehouse/priority" className="flex items-center space-x-1.5 text-lobster-pink-600 hover:text-lobster-pink-700 hover:bg-lobster-pink-50 dark:text-lobster-pink-400 dark:hover:bg-lobster-pink-950/50 px-3 py-2 rounded-lg font-bold transition-colors duration-200">
                      <ShieldAlert className="w-4 h-4" /> <span>HQ Queue</span>
                    </Link>
                    <Link href="/scoring" className="flex items-center space-x-1.5 bg-prussian-blue-900 text-silver-50 hover:bg-prussian-blue-800 dark:bg-cerulean-600 dark:hover:bg-cerulean-500 dark:text-prussian-blue-950 px-4 py-2 rounded-lg font-bold shadow-sm transition-all hover:-translate-y-0.5 ml-2 cursor-pointer">
                      <Activity className="w-4 h-4" /> <span>Score ML</span>
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 md:pb-10 relative">
            {children}
          </main>
          <MobileNavbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
