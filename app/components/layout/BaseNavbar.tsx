"use client";

import { useMemo, useState } from "react";

// Next
import Link from "next/link";
import Image from "next/image";

// Assets
import Logo from "@/public/assets/favicon/ChatGPT Image Nov 22, 2025, 12_35_49 PM.png";

// ShadCn
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import { Menu, X, Home, ChefHat, Store, FileText, ChevronDown, ChevronRight } from "lucide-react";

// Components
import { DevDebug, LanguageSelector, ThemeSwitcher } from "@/app/components";

// Hooks
import { useTranslations } from 'next-intl';

// Context
import { useSidebar } from '@/contexts/SidebarContext';

// Mobile menu items (same as sidebar)
const mobileMenuItems = [
    { icon: Home, label: "Home", href: "/en", hasSubmenu: false },
    { 
        icon: ChefHat, 
        label: "Fast Food", 
        href: "/en?category=fast-food", 
        hasSubmenu: true,
        subItems: [
            { label: "McDonald's Receipt", href: "/en/receipt-builder?template=3" },
            { label: "Subway Receipt", href: "/en/receipt-builder?template=4" },
            { label: "Starbucks Receipt", href: "/en/receipt-builder?template=5" },
            { label: "Popeyes Receipt", href: "/en/receipt-builder?template=7" }
        ]
    },
    { 
        icon: Store, 
        label: "Retail", 
        href: "/en?category=retail", 
        hasSubmenu: true,
        subItems: [
            { label: "Walmart Receipt", href: "/en/receipt-builder?template=8" },
            { label: "StockX Receipt", href: "/en/receipt-builder?template=9" },
            { label: "Louis Vuitton Receipt", href: "/en/receipt-builder?template=11" },
            { label: "Uber Eats Receipt", href: "/en/receipt-builder?template=6" }
        ]
    },
    { 
        icon: FileText, 
        label: "Invoices", 
        href: "/en?category=invoices", 
        hasSubmenu: true,
        subItems: [
            { label: "Create Invoice", href: "/en/create-receipt" },
            { label: "Receipt Builder", href: "/en/receipt-builder" }
        ]
    },
];

const BaseNavbar = () => {
    const t = useTranslations();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
    const { toggleSidebar } = useSidebar();
    const devEnv = useMemo(() => {
        return process.env.NODE_ENV === "development";
    }, []);

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSidebarToggle = () => {
        toggleSidebar();
    };

    const toggleExpandedMobile = (label: string) => {
        setExpandedMobileItems(prev => 
            prev.includes(label) 
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    return (
        <header className="w-full z-[99]">
            <nav>
                <Card className="flex items-center justify-between px-3 py-1">
                    {/* Logo on the left */}
                    <Link href={"/"}>
                        <Image
                            src={Logo}
                            alt="RGen Logo"
                            width={120}
                            height={60}
                            loading="eager"
                            style={{ height: "auto" }}
                        />
                    </Link>
                    
                    {/* Desktop navigation items - hidden on mobile */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link 
                            href="/en" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/en/create-receipt" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Create Invoice
                        </Link>
                        <Link 
                            href="/en/contact" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Contact Us
                        </Link>
                        <Link 
                            href="/en/feedback" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Feedback
                        </Link>
                    </div>
                    
                    {/* Right side - Theme switcher and mobile menu */}
                    <div className="flex items-center gap-2">
                        {/* ? DEV Only */}
                        {/* {devEnv && <DevDebug />}
                        <LanguageSelector /> */}
                        <ThemeSwitcher />
                        
                        {/* Mobile hamburger menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={handleMobileMenuToggle}
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </Card>
                
                {/* Mobile full-screen modal */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 md:hidden">
                        <div className="flex flex-col h-full">
                            {/* Header with logo and close button */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={Logo}
                                        alt="RGen Logo"
                                        width={80}
                                        height={40}
                                        loading="eager"
                                        style={{ height: "auto" }}
                                    />
                                    <ThemeSwitcher />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="h-10 w-10"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>
                            
                            {/* Menu content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                            {/* Mobile menu items (from sidebar) */}
                            {mobileMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isExpanded = expandedMobileItems.includes(item.label);

                                return (
                                    <div key={item.label}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                            onClick={() => item.hasSubmenu && toggleExpandedMobile(item.label)}
                                            asChild={!item.hasSubmenu}
                                        >
                                            {item.hasSubmenu ? (
                                                <div className="flex items-center justify-between w-full">
                                                    <Link href={item.href} className="flex items-center gap-3 flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                                                        <Icon className="h-5 w-5" />
                                                        <span className="text-base font-medium">{item.label}</span>
                                                    </Link>
                                                    <div 
                                                        className="p-2 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpandedMobile(item.label);
                                                        }}
                                                    >
                                                        <ChevronDown 
                                                            className={`h-5 w-5 transition-transform ${
                                                                isExpanded ? "rotate-180" : ""
                                                            }`} 
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link href={item.href} className="flex items-center gap-3 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Icon className="h-5 w-5" />
                                                    <span className="text-base font-medium">{item.label}</span>
                                                </Link>
                                            )}
                                        </Button>

                                        {/* Render submenu items */}
                                        {item.hasSubmenu && isExpanded && item.subItems && (
                                            <div className="ml-8 mt-2 space-y-1">
                                                {item.subItems.map((subItem) => (
                                                    <Link 
                                                        key={subItem.label}
                                                        href={subItem.href}
                                                        className="block px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        ↳ {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                            
                            {/* Regular navigation items */}
                            <Link 
                                href="/en/create-receipt" 
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <FileText className="h-5 w-5" />
                                Create Invoice
                            </Link>
                            <Link 
                                href="/en/contact" 
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            <Link 
                                href="/en/feedback" 
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Feedback
                            </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default BaseNavbar;
