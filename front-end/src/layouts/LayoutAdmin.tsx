import React, { ReactNode } from 'react';
import SidebarAdmin from './SidebarAdmin.tsx';
import Navbar from './Navbar.tsx';

type LayoutAdminProps = {
  children: ReactNode;
  onLogout: () => void;  // เพิ่ม props นี้
};

export default function LayoutAdmin({ children, onLogout }: LayoutAdminProps) {
  return (
    <div className="flex min-h-screen">
      <SidebarAdmin onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
