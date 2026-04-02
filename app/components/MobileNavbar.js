"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  ShieldAlert, 
  Activity 
} from "lucide-react";

export default function MobileNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dash" },
    { href: "/place-order", icon: ShoppingCart, label: "Order" },
    { href: "/orders", icon: Clock, label: "History" },
    { href: "/warehouse/priority", icon: ShieldAlert, label: "Queue" },
    { href: "/scoring", icon: Activity, label: "Score" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? "text-cerulean-600 dark:text-cerulean-400" 
                  : "text-foreground/60 hover:text-foreground"
              }`}
              style={{ minWidth: "48px", minHeight: "48px" }} // Minimum touch target 48px from Mobile Design Skill
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
