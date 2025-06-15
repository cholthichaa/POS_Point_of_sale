import React, { ReactNode } from 'react'; 
import CashierAdmin from './SidebarCashier.tsx';
import Navbar from './Navbar.tsx';

type LayoutCashierProps = {
  children: ReactNode;
};

export default function LayoutAdmin({ children }: LayoutCashierProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <CashierAdmin />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="p-6 flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
