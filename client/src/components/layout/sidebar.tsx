import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Handshake, 
  Settings, 
  Shield,
  LogOut,
  Menu,
  X,
  Edit,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "داشبورد", href: "/dashboard", icon: BarChart3 },
  { name: "نمایندگان", href: "/representatives", icon: Users },
  { name: "فاکتورها", href: "/invoices", icon: FileText },
  { name: "مدیریت فاکتورها", href: "/invoice-management", icon: Edit },
  { name: "همکاران فروش", href: "/sales-partners", icon: Handshake },
  { name: "یکپارچگی مالی", href: "/financial-integrity", icon: ShieldCheck },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "admin-sidebar fixed right-0 top-0 h-screen z-50 w-80 transform transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">MarFaNet</h1>
                <p className="text-sm text-blue-200">سیستم مدیریت مالی</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={onToggle}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4 flex-1">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                             (item.href === "/dashboard" && location === "/");
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "admin-nav-item flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                    isActive
                      ? "active text-white"
                      : "text-blue-100 hover:text-white"
                  )}
                >
                  <item.icon className="ml-3 w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-white/10">
          <div className="admin-glass-card p-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">حسابدار اصلی</p>
                <p className="text-xs text-blue-200">admin@marfanet.com</p>
              </div>
              <button className="text-blue-200 hover:text-white transition-colors duration-200">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
