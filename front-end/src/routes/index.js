import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LayoutAdmin from "../layouts/LayoutAdmin.tsx";
import LayoutCashier from "../layouts/LayoutCashier.tsx";
import Home from "../view/Home.tsx";
import Dashboard from "../view/Dashboard.tsx";
import ManageUser from "../view/ManageUser.tsx";
import ManageMenu from "../view/ManageMenu.tsx";
import ManageCategory from "../view/ManageCategory.tsx";
import ManageTable from "../view/ManageTable.tsx";
import ManageBill from "../view/ManageBill.tsx";
import ManageBillCashier from "../view/ManageBillCashier.tsx";
import BillCashier from "../view/Bill.tsx";
import EditBillCashier from "../view/EditBill.tsx";
import Payment from "../view/payment.tsx";
import EditOder from "../view/EditOrder.tsx";
import AddUser from "../view/Adduser.tsx";
import EditUser from "../view/EditUser.tsx";
import ChangPassword from "../view/change-password.tsx";
import BillAdmin from "../view/BillAdmin.tsx";
import AddMenu from "../view/add-menu.tsx";
import EditMenu from "../view/edit-menu.tsx";
import ManageZones from "../view/ManageZones.tsx";
import EditOderUpdate from "../view/EditOrderUpdate.tsx";
import Bill from "../view/Bill.tsx";
import AllBill from "../view/AllBillCashier.tsx";

function AppRoutes({ role, userId, onLogout }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {role === "admin" && (
        <>
          <Route
            path="/admin/dashboard"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <Dashboard />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-user"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageUser />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-menu"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageMenu />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-category"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageCategory />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-table"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageTable />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-bill"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageBill />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/add-user"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <AddUser />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/edit-user/:id"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <EditUser />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ChangPassword />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/bill-admin"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <BillAdmin />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/add-menu"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <AddMenu />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/edit-menu/:id"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <EditMenu />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/manage-zones"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <ManageZones />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/bill/:orderId"
            element={
              <LayoutAdmin userId={userId} onLogout={onLogout}>
                <Bill />
              </LayoutAdmin>
            }
          />
        </>
      )}

      {role === "cashier" && (
        <>
          <Route
            path="/cashier/home"
            element={
              <LayoutCashier userId={userId}>
                <Home />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/manage-bill-cashier"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <ManageBillCashier />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/bill"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <BillCashier />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/manager-bill/:orderId"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <EditBillCashier />
              </LayoutCashier>
            }
          />

          <Route
            path="/cashier/payment/:orderId"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <Payment />
              </LayoutCashier>
            }
          />

          <Route
            path="/cashier/edit-order/:tableId"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <EditOder />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/order-update/:orderId"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <EditOderUpdate />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/bill/:orderId"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <Bill />
              </LayoutCashier>
            }
          />
          <Route
            path="/cashier/all-bill"
            element={
              <LayoutCashier userId={userId} onLogout={onLogout}>
                <AllBill />
              </LayoutCashier>
            }
          />
        </>
      )}

      <Route
        path="*"
        element={
          role === "admin" ? (
            <Navigate to="/admin/dashboard" replace />
          ) : role === "cashier" ? (
            <Navigate to="/cashier/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default AppRoutes;
