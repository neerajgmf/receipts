"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
    Home, 
    ChefHat, 
    Utensils, 
    Cross, 
    Building2, 
    FileText, 
    Store, 
    ShoppingCart, 
    Receipt, 
    Car, 
    Building, 
    Fuel,
    Phone,
    ChevronDown,
    ChevronRight,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Context
import { useSidebar } from '@/contexts/SidebarContext';

const menuItems = [
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

const TemplatesSidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const { isSidebarOpen, closeSidebar } = useSidebar();

    const toggleExpanded = (label: string) => {
        setExpandedItems(prev => 
            prev.includes(label) 
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const isItemActive = (item: any) => {
        const category = searchParams.get('category');
        
        if (item.label === "Home" && pathname === "/en" && !category) {
            return true;
        }
        
        if (item.label === "Fast Food" && category === "fast-food") {
            return true;
        }
        
        if (item.label === "Retail" && category === "retail") {
            return true;
        }
        
        if (item.label === "Invoices" && category === "invoices") {
            return true;
        }
        
        return false;
    };

    return (
        <Card className="hidden md:block w-80 min-h-screen bg-white dark:bg-gray-800 border-r border-l-0 border-t-0 border-b-0 rounded-none">
                <div className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="text-blue-600 text-xl font-bold">Menu</div>
                        <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isExpanded = expandedItems.includes(item.label);
                        const isActive = isItemActive(item);

                        return (
                            <div key={item.label}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 h-12 ${
                                        isActive 
                                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                    onClick={() => item.hasSubmenu && toggleExpanded(item.label)}
                                    asChild={!item.hasSubmenu}
                                >
                                    {item.hasSubmenu ? (
                                        <div className="flex items-center justify-between w-full">
                                            <Link href={item.href} className="flex items-center gap-3 flex-1">
                                                <Icon className="h-5 w-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                            <div 
                                                className="p-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpanded(item.label);
                                                }}
                                            >
                                                <ChevronDown 
                                                    className={`h-4 w-4 transition-transform ${
                                                        isExpanded ? "rotate-180" : ""
                                                    }`} 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <Link href={item.href} className="flex items-center gap-3 w-full">
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
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
                                                className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                ↳ {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </Card>
    );
};

export default TemplatesSidebar;