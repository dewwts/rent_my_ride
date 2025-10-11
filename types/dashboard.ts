import { LucideIcon } from "lucide-react"; 
import React from "react"; 

// 1. Interface สำหรับ Menu Item ธรรมดา
export interface StandardMenuItem {
    href: string; 
    label: string;
    icon: React.ReactElement<LucideIcon>;
    isDropdown?: false; 
}

// 2. Interface สำหรับ Menu Item ที่เป็น Dropdown
export interface DropdownMenuItemType {
    href?: never; 
    label: string;
    icon: React.ReactElement<LucideIcon>;
    isDropdown: true;
    subItems: StandardMenuItem[];
}

// Type รวมสำหรับเมนูทั้งหมด
export type MenuItem = StandardMenuItem | DropdownMenuItemType;