import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";
import expenseService from "../services/expenseService";
import aiService from "../services/aiService";
import profileService from "../services/profileService";
import financeService from "../services/financeService";
import { Sparkles, Loader2, User, Save } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const [prediction, setPrediction] = useState(null);
  const [behavior, setBehavior] = useState(null);

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [profile, setProfile] = useState({
    monthlyIncome: 0,
    savingsGoal: 0,
    monthlyBudget: 0,
    financialDescription: "",
    strategy: "Moderate"
  });
  const [fixedCosts, setFixedCosts] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, profileRes, predictionRes, behaviorRes, emisRes, billsRes] = await Promise.allSettled([
          expenseService.getMonthlySummary(),
          profileService.getProfile(),
          aiService.getPrediction(),
          aiService.getBehaviorInsights(),
          financeService.getEmis(),
          financeService.getBills()
        ]);

        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (predictionRes.status === 'fulfilled') setPrediction(predictionRes.value.data);
        if (behaviorRes.status === 'fulfilled') setBehavior(behaviorRes.value.data);
        
        let totalFixed = 0;
        if (emisRes.status === 'fulfilled') {
          totalFixed += emisRes.value.data.reduce((acc, e) => acc + e.amount, 0);
        }
        if (billsRes.status === 'fulfilled') {
          totalFixed += billsRes.value.data.reduce((acc, b) => acc + b.amount, 0);
        }
        setFixedCosts(totalFixed);
      } catch (err) {
        console.error("Error loading analytics data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      await profileService.updateProfile(profile);
      // Reload insights to reflect new profile
      const [predictionRes, behaviorRes] = await Promise.all([
        aiService.getPrediction(),
        aiService.getBehaviorInsights(),
      ]);
      setPrediction(predictionRes.data);
      setBehavior(behaviorRes.data);
    } catch (error) {
      console.error("Error saving profile", error);
    }
    setSaveLoading(false);
  };

  const generateReport = async () => {
    setReportLoading(true);

    try {
      const res = await aiService.generateFinancialReport();
      setReport(res.data);
    } catch (error) {
      console.error("Error generating AI report", error);
    }

    setReportLoading(false);
  };

  const totalExpenses = summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts;

  const barData = {
    labels: summary.map((s) => s.category),
    datasets: [
      {
        label: "Spending (₹)",
        data: summary.map((s) => s.totalAmount),
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        barThickness: 40,
      },
    ],
  };

  const pieData = {
    labels: summary.map((s) => s.category),
    datasets: [
      {
        data: summary.map((s) => s.totalAmount),
        backgroundColor: [
          "#3B82F6",
          "#22C55E",
          "#EF4444",
          "#F59E0B",
          "#8B5CF6",
          "#EC4899",
          "#64748B",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: "500" },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        Loading analytics...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Finance Settings & Insights</h2>

        <select className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium outline-none shadow-sm">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      {/* Profile Management Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <User className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold">Personalize Your AI</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monthly Income (₹)</label>
            <input 
              type="number" 
              value={profile.monthlyIncome} 
              onChange={e => setProfile({...profile, monthlyIncome: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="e.g. 50000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Savings Goal (₹)</label>
            <input 
              type="number" 
              value={profile.savingsGoal} 
              onChange={e => setProfile({...profile, savingsGoal: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="e.g. 10000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Budget (₹)</label>
            <input 
              type="number" 
              value={profile.monthlyBudget} 
              onChange={e => setProfile({...profile, monthlyBudget: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="e.g. 20000"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lifestyle/Context</label>
            <textarea 
              value={profile.financialDescription} 
              onChange={e => setProfile({...profile, financialDescription: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition h-20"
              placeholder="e.g. Student with occasional freelance income, focusing on travel savings."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Financial Strategy</label>
            <select 
              value={profile.strategy} 
              onChange={e => setProfile({...profile, strategy: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
            >
              <option value="Aggressive">Aggressive</option>
              <option value="Moderate">Moderate</option>
              <option value="Conservative">Conservative</option>
            </select>
            <button 
              onClick={handleSaveProfile}
              disabled={saveLoading}
              className="mt-4 w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition"
            >
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8">Category Distribution</h3>

          <div className="h-[400px]">
            {summary.length > 0 ? (
              <Pie data={pieData} options={options} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8">
            Monthly Spending by Category
          </h3>

          <div className="h-[400px]">
            {summary.length > 0 ? (
              <Bar data={barData} options={options} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Insights */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Financial Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Highest Spending */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-1">Highest Spending Category</p>
            <p className="text-lg font-bold text-gray-800">
              {summary.length > 0
                ? [...summary].sort((a, b) => b.totalAmount - a.totalAmount)[0].category
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Focus on reducing this category next month.</p>
          </div>

          {/* Surplus/Deficit */}
          <div className={`p-4 rounded-2xl border ${
            (profile.monthlyIncome - (summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts)) < 0 
              ? "bg-red-50 border-red-100" 
              : "bg-green-50 border-green-100"
          }`}>
             <p className={`${
               (profile.monthlyIncome - (summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts)) < 0 
                 ? "text-red-600" 
                 : "text-green-600"
             } text-xs font-bold uppercase mb-1 whitespace-nowrap`}>
               {(profile.monthlyIncome - (summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts)) < 0 ? 'Current Deficit' : 'Current Surplus'}
             </p>
             <p className="text-xl font-black text-gray-800">
               ₹{Math.abs(profile.monthlyIncome - (summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts)).toLocaleString()}
             </p>
             <p className="text-xs text-gray-500 mt-1 font-medium leading-tight">
               {(profile.monthlyIncome - (summary.reduce((acc, s) => acc + s.totalAmount, 0) + fixedCosts)) < 0 
                 ? "You are spending more than your monthly income." 
                 : "Your remaining income after this month's expenses."}
             </p>
          </div>

          {/* Budget Status */}
          <div className={`p-4 rounded-2xl border ${
            totalExpenses > profile.monthlyBudget
              ? "bg-red-50 border-red-100"
              : "bg-purple-50 border-purple-100"
          }`}>
            <p className={`${
              totalExpenses > profile.monthlyBudget
                ? "text-red-600"
                : "text-purple-600"
            } text-xs font-bold uppercase mb-1 `}>
              Budget Status
            </p>
            <p className="text-lg font-bold text-gray-800">
              {totalExpenses > profile.monthlyBudget
                ? "Over Budget"
                : totalExpenses > profile.monthlyBudget * 0.8
                ? "Warning"
                : "On Track"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Used {((totalExpenses / (profile.monthlyBudget || 1)) * 100).toFixed(0)}% of monthly target.
            </p>
          </div>
        </div>
      </div>

      {/* AI Prediction + Behavior */}

      {(prediction || behavior) && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">AI Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prediction && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-orange-600 text-xs font-bold uppercase mb-1">
                  Predicted Monthly Spending
                </p>

                <p className="text-lg font-bold text-gray-800">
                  ₹{prediction.projectedMonthEndSpending?.toLocaleString()}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {prediction.insight}
                </p>
              </div>
            )}

            {behavior && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-purple-600 text-xs font-bold uppercase mb-1">
                  Dominant Category
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {behavior.dominantCategory}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {behavior.dominantCategoryPercentage}% of your spending.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Report Generator */}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5" />
            AI Financial Report
          </h3>

          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition"
          >
            {reportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Generate Report"
            )}
          </button>
        </div>

        {report && (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* EMI Miss Probability */}
              <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-red-200 transition group hover:shadow-md">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Miss Probability</p>
                <p className="text-2xl font-black text-gray-800">{report.emiMissProbability}%</p>
                <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full">
                  <div className={`h-full rounded-full transition-all duration-1000 bg-red-500`} style={{ width: `${report.emiMissProbability}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">EMI/Bills default Risk</p>
              </div>

              {/* Fixed Cost Health */}
              <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-amber-200 transition group hover:shadow-md">
                <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest mb-1">Fixed Load Health</p>
                <p className={`text-xl font-black ${report.fixedCostHealth === 'Safe' ? 'text-green-600' : 'text-amber-600 uppercase'}`}>{report.fixedCostHealth}</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{report.fixedCommitmentRatio}% <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">of income</span></p>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Fixed vs Income</p>
              </div>

              {/* Burn Rate */}
              <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-200 transition group hover:shadow-md">
                <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Current Burn Rate</p>
                <p className="text-xl font-black text-gray-800 uppercase tracking-tight">{report.burnRateStatus}</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Spending velocity</p>
              </div>

              {/* Buffer Days */}
              <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition group hover:shadow-md">
                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Financial Buffer</p>
                <p className="text-2xl font-black text-gray-800">{report.bufferDays} Days</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Survival at current cost</p>
              </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 Strategic AI Guidance
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {report.recommendations?.map((rec, i) => (
                   <div key={i} className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-blue-100 transition shadow-sm group">
                     <span className="w-8 h-8 flex-shrink-0 bg-white border border-gray-100 text-blue-600 rounded-xl flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition">{i+1}</span>
                     <p className="text-sm text-gray-600 font-semibold leading-relaxed pt-1">{rec}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;