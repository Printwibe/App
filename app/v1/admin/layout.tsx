"use client";

import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/v1/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page gets clean layout without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // All other admin pages get full dashboard layout
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
