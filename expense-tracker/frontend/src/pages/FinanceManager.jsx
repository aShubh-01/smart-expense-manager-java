import React, { useState, useEffect } from "react";
import financeService from "../services/financeService";
import {
  CreditCard,
  Receipt,
  HelpCircle,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const FinanceManager = () => {
  const [activeTab, setActiveTab] = useState("bills");
  const [data, setData] = useState({ emis: [], debts: [], bills: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form States
  const [formData, setFormData] = useState({});
  const [adjustingDebt, setAdjustingDebt] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);

  const getDaysUntilDue = (dateString) => {
    if (!dateString) return 999;
    const d = new Date(dateString);
    const now = new Date();
    d.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.round((d - now) / (1000 * 60 * 60 * 24));
  };

  const isDueToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    d.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return d.getTime() === now.getTime();
  };

  const getUnlockWindowDays = (recurrenceType, recurrenceValue) => {
    const type = recurrenceType?.toUpperCase() || 'MONTHLY';
    const val = recurrenceValue || 1;
    let totalDays = 30; // default to monthly
    if (type === 'DAILY') totalDays = val * 1;
    if (type === 'WEEKLY') totalDays = val * 7;
    if (type === 'MONTHLY') totalDays = val * 30;
    if (type === 'YEARLY') totalDays = val * 365;
    return totalDays / 2;
  };

  const isOverdue = (dateString, isPaid) => {
    if (isPaid) return false;
    return getDaysUntilDue(dateString) < 0;
  };

  const canPay = (item) => {
    if (item.isPaid) return false;
    const date = item.nextDueDate || item.nextInstallmentDate;
    const unlockWindow = getUnlockWindowDays(item.recurrenceType, item.recurrenceValue);
    return getDaysUntilDue(date) <= unlockWindow;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [emis, debts, bills] = await Promise.all([
        financeService.getEmis(),
        financeService.getDebts(),
        financeService.getBills()
      ]);
      setData({ emis: emis.data, debts: debts.data, bills: bills.data });
    } catch (err) {
      console.error("Error fetching finance data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "emis") await financeService.saveEmi(formData);
      if (activeTab === "debts") await financeService.saveDebt(formData);
      if (activeTab === "bills") await financeService.saveBill(formData);

      setShowForm(false);
      setFormData({});
      fetchData();
    } catch (err) {
      console.error("Error saving data", err);
    }
  };

  const handleUpdateDebt = async (debt, paidAmount) => {
    try {
      const updatedDebt = {
        ...debt,
        amountPaid: (debt.amountPaid || 0) + Number(paidAmount),
        totalAmount: debt.totalAmount - Number(paidAmount)
      };
      await financeService.saveDebt(updatedDebt);
      fetchData();
    } catch (err) {
      console.error("Error updating debt", err);
    }
  };

  const advanceDate = (dateString, type, val) => {
    const date = new Date(dateString);
    const t = type?.toUpperCase() || 'MONTHLY';
    const v = val || 1;
    if (t === 'DAILY') date.setDate(date.getDate() + v);
    if (t === 'WEEKLY') date.setDate(date.getDate() + (v * 7));
    if (t === 'MONTHLY') date.setMonth(date.getMonth() + v);
    if (t === 'YEARLY') date.setFullYear(date.getFullYear() + v);
    return date.toISOString().split('T')[0];
  };

  const handleBillPaid = async (bill) => {
    try {
      const nextDateString = advanceDate(bill.nextDueDate, bill.recurrenceType, bill.recurrenceValue);
      const updatedBill = {
        ...bill,
        isPaid: true,
        nextDueDate: nextDateString,
        lastPaidDate: new Date().toISOString().split('T')[0]
      };
      await financeService.saveBill(updatedBill);
      fetchData();
    } catch (err) {
      console.error("Error updating bill", err);
    }
  };

  const handleEmiPaid = async (emi) => {
    try {
      const nextDate = new Date(emi.nextInstallmentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const updatedEmi = {
        ...emi,
        remainingTenureMonths: Math.max(0, emi.remainingTenureMonths - 1),
        isPaid: true,
        nextInstallmentDate: nextDate.toISOString().split('T')[0],
        lastPaidDate: new Date().toISOString().split('T')[0]
      };
      await financeService.saveEmi(updatedEmi);
      fetchData();
    } catch (err) {
      console.error("Error updating EMI", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === "emis") await financeService.deleteEmi(id);
      if (activeTab === "debts") await financeService.deleteDebt(id);
      if (activeTab === "bills") await financeService.deleteBill(id);
      fetchData();
    } catch (err) {
      console.error("Error deleting data", err);
    }
  };

  const tabs = [
    { id: "bills", label: "Recurring Bills", icon: Receipt },
    { id: "emis", label: "EMI / Installments", icon: Clock },
    { id: "debts", label: "Debt Manager", icon: AlertCircle },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your finances...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Wealth Guard</h2>
          <p className="text-gray-500">Manage your commitments, debts, and regular payments.</p>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setFormData({}); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
        >
          {showForm ? "Cancel" : <><Plus className="w-5 h-5" /> Add {activeTab === "bills" ? "Bill" : activeTab === "emis" ? "Installment" : "Debt"}</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "bills" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Bill Title</label>
                  <input required placeholder="e.g. House Rent" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Amount (₹)</label>
                  <input type="number" required placeholder="0.00" value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Recurrence</label>
                  <div className="flex gap-2">
                    <select required value={formData.recurrenceType || "MONTHLY"} onChange={e => setFormData({ ...formData, recurrenceType: e.target.value })} className="bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 flex-1">
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                    <input type="number" placeholder="Value" value={formData.recurrenceValue || 1} onChange={e => setFormData({ ...formData, recurrenceValue: parseInt(e.target.value) })} className="w-20 bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Next Due Date</label>
                  <input type="date" required value={formData.nextDueDate || ""} onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}

            {activeTab === "emis" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Loan Name</label>
                  <input required placeholder="e.g. Home Loan" value={formData.loanName || ""} onChange={e => setFormData({ ...formData, loanName: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Monthly Installment (₹)</label>
                  <input type="number" required value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Next Installment Date</label>
                  <input type="date" required value={formData.nextInstallmentDate || ""} onChange={e => setFormData({ ...formData, nextInstallmentDate: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Remaining Months</label>
                  <input type="number" required value={formData.remainingTenureMonths || ""} onChange={e => setFormData({ ...formData, remainingTenureMonths: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}

            {activeTab === "debts" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Lender</label>
                  <input required placeholder="e.g. ICICI Bank" value={formData.lender || ""} onChange={e => setFormData({ ...formData, lender: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Total Outstanding (₹)</label>
                  <input type="number" required value={formData.totalAmount || ""} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Monthly Installment (₹)</label>
                  <input type="number" required value={formData.installmentAmount || ""} onChange={e => setFormData({ ...formData, installmentAmount: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}

            <div className="md:col-span-full flex justify-end pt-4">
              <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">
                Save {activeTab}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bills Section */}
      {activeTab === "bills" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2 text-center">Payable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.bills.filter(b => !b.isPaid && canPay(b)).map((bill) => (
              <div key={bill.id} className={`bg-white p-6 rounded-3xl border transition group relative ${isOverdue(bill.nextDueDate, bill.isPaid) ? 'border-red-400 border-2 shadow-xl shadow-red-100' : isDueToday(bill.nextDueDate) ? 'border-red-600 border-[3px] animate-pulse bg-red-50/30' : 'border-gray-100'}`}>
                {isDueToday(bill.nextDueDate) && (
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full rotate-12 shadow-md z-20">DUE TODAY!</div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${isOverdue(bill.nextDueDate, bill.isPaid) || isDueToday(bill.nextDueDate) ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-orange-50 text-orange-600'}`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                  <button onClick={() => handleDelete(bill.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h4 className="text-xl font-black text-gray-800">{bill.title}</h4>
                <div className="flex flex-col gap-1 mt-2">
                  <p className={`text-sm font-bold flex items-center gap-1 ${isOverdue(bill.nextDueDate, bill.isPaid) || isDueToday(bill.nextDueDate) ? 'text-red-600' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" /> Due: {bill.nextDueDate}
                  </p>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mt-6">₹{bill.amount.toLocaleString()}</h3>

                <div className="mt-6">
                  <button
                    onClick={() => handleBillPaid(bill)}
                    className="w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-100 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                  </button>
                </div>
              </div>
            ))}
            {data.bills.filter(b => !b.isPaid && canPay(b)).length === 0 && (
              <div className="col-span-full py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm font-bold text-center px-4 italic">No immediate payments. Either all bills are settled or not yet due for payment window.</p>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2 pt-6 text-center">Future / Settled</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.bills.filter(b => b.isPaid || !canPay(b)).map((bill) => (
              <div key={bill.id} className="bg-white p-6 rounded-3xl border border-gray-100 relative group shadow-sm">
                <div className="absolute top-4 right-4">
                  {bill.isPaid ? <CheckCircle2 className="w-5 h-5 text-green-600 animate-in zoom-in" /> : <Clock className="w-5 h-5 text-gray-300" />}
                </div>
                <button onClick={() => handleDelete(bill.id)} className="absolute bottom-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-2xl ${bill.isPaid ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-gray-800">{bill.title}</h4>
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {bill.isPaid ? 'Next Due:' : 'Future Due:'} {bill.nextDueDate}
                  </p>
                  {!bill.isPaid && (
                    <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 bg-blue-50/50 w-fit px-2 py-0.5 rounded-full mt-1">
                      <Clock className="w-3 h-3" /> Unlock in {getDaysUntilDue(bill.nextDueDate) - Math.floor(getUnlockWindowDays(bill.recurrenceType, bill.recurrenceValue))} days
                    </p>
                  )}
                </div>
                <h3 className={`text-xl font-black mt-4 ${bill.isPaid ? 'text-gray-300 line-through' : 'text-gray-600'}`}>₹{bill.amount.toLocaleString()}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content grid for other tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "emis" && (
          <>
            <div className="col-span-full">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2 mb-4 text-center">Payable</h3>
            </div>
            {data.emis.filter(e => !e.isPaid && canPay(e)).map((emi) => (
              <div key={emi.id} className={`bg-white p-6 rounded-3xl border transition group relative ${isOverdue(emi.nextInstallmentDate, emi.isPaid) ? 'border-red-400 border-2 shadow-xl shadow-red-100' : isDueToday(emi.nextInstallmentDate) ? 'border-red-600 border-[3px] animate-pulse bg-red-50/30' : 'border-gray-100'}`}>
                {isDueToday(emi.nextInstallmentDate) && (
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full rotate-12 shadow-md z-20">DUE TODAY!</div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${isOverdue(emi.nextInstallmentDate, emi.isPaid) || isDueToday(emi.nextInstallmentDate) ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-blue-50 text-blue-600'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <button onClick={() => handleDelete(emi.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h4 className="text-xl font-black text-gray-800">{emi.loanName}</h4>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{emi.remainingTenureMonths} installments left</p>
                  </div>
                  <p className={`text-sm font-bold flex items-center gap-1 ${isOverdue(emi.nextInstallmentDate, emi.isPaid) || isDueToday(emi.nextInstallmentDate) ? 'text-red-600' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" /> Due: {emi.nextInstallmentDate}
                  </p>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mt-6">₹{emi.amount.toLocaleString()}</h3>

                <div className="mt-6">
                  <button
                    onClick={() => handleEmiPaid(emi)}
                    className="w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                  </button>
                </div>
              </div>
            ))}
            {data.emis.filter(e => !e.isPaid && canPay(e)).length === 0 && (
              <div className="col-span-full py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm font-bold text-center italic">No pending installments due for payment.</p>
              </div>
            )}

            <div className="col-span-full mt-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2 mb-4 text-center">Future / Settled</h3>
            </div>
            {data.emis.filter(e => e.isPaid || !canPay(e)).map((emi) => (
              <div key={emi.id} className="bg-white p-6 rounded-3xl border border-gray-100 relative group shadow-sm">
                <div className="absolute top-4 right-4">
                  {emi.isPaid ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-300" />}
                </div>
                <button onClick={() => handleDelete(emi.id)} className="absolute bottom-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-2xl ${emi.isPaid ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-gray-800">{emi.loanName}</h4>
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {emi.isPaid ? 'Next Due:' : 'Future Due:'} {emi.nextInstallmentDate}
                  </p>
                  {!emi.isPaid && (
                    <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 bg-blue-50/50 w-fit px-2 py-0.5 rounded-full mt-1">
                      <Clock className="w-3 h-3" /> Unlock in {getDaysUntilDue(emi.nextInstallmentDate) - 15} days
                    </p>
                  )}
                </div>
                <h3 className={`text-xl font-black mt-4 ${emi.isPaid ? 'text-gray-300 line-through' : 'text-gray-600'}`}>₹{emi.amount.toLocaleString()}</h3>
              </div>
            ))}
          </>
        )}

        {activeTab === "debts" && data.debts.map((debt) => (
          <div key={debt.id} className="bg-white p-6 rounded-3xl border border-gray-100 border-l-4 border-l-red-400 hover:border-red-100 transition group relative overflow-hidden h-full">
            {adjustingDebt?.id === debt.id ? (
              <div className="bg-white z-20 flex flex-col justify-center animate-in zoom-in duration-200 rounded-3xl h-full">
                <h4 className="text-center font-black text-gray-800 mb-2 uppercase tracking-tighter text-xs">Adjust Balance</h4>

                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => setAdjustAmount(a => a - 500)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl hover:bg-red-50 hover:text-red-600 transition">-</button>

                    <div className="relative">
                      <input
                        type="number"
                        className={`w-32 text-center text-2xl font-black bg-transparent border-b-2 outline-none ${adjustAmount >= 0 ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'}`}
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                      />
                      <span className="absolute -left-4 top-1 font-bold text-gray-400">₹</span>
                    </div>

                    <button type="button" onClick={() => setAdjustAmount(a => a + 500)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl hover:bg-blue-50 hover:text-blue-600 transition">+</button>
                  </div>

                  <p className={`text-[10px] font-bold uppercase mt-1 px-4 py-1 rounded-full ${adjustAmount >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {adjustAmount >= 0 ? 'Reducing Debt' : 'Increasing Debt'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { handleUpdateDebt(debt, adjustAmount); setAdjustingDebt(null); setAdjustAmount(0); }}
                    className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg text-sm"
                  >
                    Confirm
                  </button>
                  <button type="button" onClick={() => { setAdjustingDebt(null); setAdjustAmount(0); }} className="px-4 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-50 p-3 rounded-2xl text-red-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <button onClick={() => handleDelete(debt.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-800">{debt.lender}</h4>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-600">₹{debt.totalAmount.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Remaining</span>
                </div>

                <div className="mt-2 text-xs font-bold text-gray-500 flex items-center justify-between">
                  <span>Goal: ₹{debt.installmentAmount?.toLocaleString() || '0'}</span>
                  <span>Paid so far: ₹{debt.amountPaid?.toLocaleString() || '0'}</span>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => { setAdjustingDebt(debt); setAdjustAmount(debt.installmentAmount || 500); }}
                    className="w-full bg-gray-900 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg"
                  >
                    <IndianRupee className="w-4 h-4" /> Adjust Amount
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeTab !== "bills" && data[activeTab].length === 0 && !showForm && (
          <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
            <div className="p-5 bg-white rounded-full shadow-sm text-gray-300">
              <HelpCircle className="w-10 h-10" />
            </div>
            <p className="text-gray-500 font-medium">No {activeTab} tracked yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManager;
