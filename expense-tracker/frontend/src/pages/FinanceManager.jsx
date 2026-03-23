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
    { id: "emis", label: "EMI Tracker", icon: Clock },
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
          {showForm ? "Cancel" : <><Plus className="w-5 h-5" /> Add New {activeTab === "bills" ? "Bill" : activeTab === "emis" ? "EMI" : "Debt"}</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
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
                  <input required placeholder="e.g. House Rent" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Amount (₹)</label>
                  <input type="number" required placeholder="0.00" value={formData.amount || ""} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Next Due Date</label>
                  <input type="date" required value={formData.nextDueDate || ""} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}

            {activeTab === "emis" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Loan Name</label>
                  <input required placeholder="e.g. Home Loan" value={formData.loanName || ""} onChange={e => setFormData({...formData, loanName: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Monthly EMI (₹)</label>
                  <input type="number" required value={formData.amount || ""} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Remaining Months</label>
                  <input type="number" required value={formData.remainingTenureMonths || ""} onChange={e => setFormData({...formData, remainingTenureMonths: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}

            {activeTab === "debts" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Lender</label>
                  <input required placeholder="e.g. ICICI Bank" value={formData.lender || ""} onChange={e => setFormData({...formData, lender: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Total Outstanding (₹)</label>
                  <input type="number" required value={formData.totalAmount || ""} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Due Date</label>
                  <input type="date" required value={formData.dueDate || ""} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" />
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

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "bills" && data.bills.map((bill) => (
          <div key={bill.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 transition group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
                <Receipt className="w-6 h-6" />
              </div>
              <button onClick={() => handleDelete(bill.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{bill.title}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Due on {bill.nextDueDate}
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-4">₹{bill.amount.toLocaleString()}</h3>
          </div>
        ))}

        {activeTab === "emis" && data.emis.map((emi) => (
          <div key={emi.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 transition group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <button onClick={() => handleDelete(emi.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{emi.loanName}</h4>
            <p className="text-sm text-gray-500 mt-1">{emi.remainingTenureMonths} installments left</p>
            <h3 className="text-2xl font-black text-gray-900 mt-4">₹{emi.amount.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ month</span></h3>
          </div>
        ))}

        {activeTab === "debts" && data.debts.map((debt) => (
          <div key={debt.id} className="bg-white p-6 rounded-3xl border border-gray-100 border-l-4 border-l-red-400 hover:border-red-100 transition group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-50 p-3 rounded-2xl text-red-600">
                <Building2 className="w-6 h-6" />
              </div>
              <button onClick={() => handleDelete(debt.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{debt.lender}</h4>
            <p className="text-sm text-gray-500 mt-1">Due Date: {debt.dueDate || 'N/A'}</p>
            <h3 className="text-2xl font-black text-red-600 mt-4">₹{debt.totalAmount.toLocaleString()}</h3>
          </div>
        ))}

        {data[activeTab].length === 0 && !showForm && (
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
