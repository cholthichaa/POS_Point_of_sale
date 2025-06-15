'use client'
import React, { useRef } from 'react'

export default function FoodOrderInvoice({
    orderId = '0001',
    tableNumber = 'A01',
    date = '2025-05-21 18:58:48',
    status = 'ชำระเงินแล้ว',
    items = [
        { name: 'ชานมไข่มุก', qty: 1, price: 80 },
        { name: 'ชาไทย', qty: 1, price: 80 },
        { name: 'ข้าวผัดหมูกรอบ', qty: 2, price: 180 },
    ],
}) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        if (printRef.current) {
            const originalContents = document.body.innerHTML
            const printContents = printRef.current.innerHTML

            document.body.innerHTML = printContents
            window.print()
            document.body.innerHTML = originalContents
            window.location.reload()
        }
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

    return (
        <div className="w-full min-h-screen bg-gray-100 p-6">
            <div ref={printRef} className="max-w-3xl mx-auto bg-white p-8 rounded shadow-md font-sans text-gray-800">
                <h1 className="text-2xl font-bold text-center mb-6">ใบแจ้งค่าอาหาร</h1>

                <div className="mb-6 text-sm">
                    <div className="flex justify-between mb-1"><span>Order ID :</span><span>{orderId}</span></div>
                    <div className="flex justify-between mb-1"><span>หมายเลขโต๊ะ :</span><span>{tableNumber}</span></div>
                    <div className="flex justify-between mb-1"><span>วันที่ :</span><span>{date}</span></div>
                    <div className="flex justify-between border-b border-gray-300 pb-2 font-semibold">
                        <span>สถานะ :</span>
                        <span>{status}</span>
                    </div>
                </div>

                <table className="w-full text-left mb-6">
                    <thead>
                        <tr className="border-b border-gray-300 font-semibold">
                            <th className="pb-2">รายการ</th>
                            <th className="pb-2 text-center w-20">จำนวน</th>
                            <th className="pb-2 text-right w-28">ราคา</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className={i !== items.length - 1 ? 'border-b border-gray-200' : ''}>
                                <td className="py-2">{item.name}</td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">{item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-300 font-semibold">
                            <td className="py-3 text-right" colSpan={2}>ราคา</td>
                            <td className="text-right">{totalPrice.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                  {/* ปุ่ม */}
            <div className="flex justify-end gap-4 mt-4 print:hidden">

                <button
                    className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-400"
                    onClick={handlePrint}
                >
                    พิมพ์ใบเสร็จ
                </button>

            </div>
            </div>

          
        </div>
    )
}
