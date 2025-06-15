import React from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const Navbar: React.FC = () => {
  return (
    <div className="w-full h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
      {/* Title */}
      <h1 className="text-sm text-gray-300 font-semibold">
        ระบบจัดการหน้าร้าน
      </h1>

      {/* Profile icon */}
      <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center">
        <UserCircleIcon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default Navbar;
