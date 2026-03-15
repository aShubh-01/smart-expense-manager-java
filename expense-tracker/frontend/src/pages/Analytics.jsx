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
import { Sparkles, Loader2 } from "lucide-react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, predictionRes, behaviorRes] = await Promise.all([
          expenseService.getMonthlySummary(),
          aiService.getPrediction(),
          aiService.getBehaviorInsights(),
        ]);

        setSummary(summaryRes.data);
        setPrediction(predictionRes.data);
        setBehavior(behaviorRes.data);
      } catch (error) {
        console.error("Error loading analytics", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const generateReport = async () => {
    setReportLoading(true);

    try {
      const res = await aiService.generateFinancialReport({
        income: "45000",
        goal: "10000",
        strategy: "Reduce food delivery spending",
      });

      setReport(res.data);
    } catch (error) {
      console.error("Error generating AI report", error);
    }

    setReportLoading(false);
  };

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
        <h2 className="text-2xl font-bold">Spending Analytics</h2>

        <select className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium outline-none">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 6 Months</option>
        </select>
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

      {/* Basic Insights */}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Insights</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-1">
              Highest Spending
            </p>

            <p className="text-lg font-bold text-gray-800">
              {summary.length > 0
                ? summary.sort((a, b) => b.totalAmount - a.totalAmount)[0]
                    .category
                : "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Focus on reducing this category next month.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
            <p className="text-green-600 text-xs font-bold uppercase mb-1">
              Savings Potential
            </p>

            <p className="text-lg font-bold text-gray-800">₹4,500</p>

            <p className="text-sm text-gray-500 mt-1">
              You can save more by cutting down on Entertainment.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-purple-600 text-xs font-bold uppercase mb-1">
              Budget Status
            </p>

            <p className="text-lg font-bold text-gray-800">On Track</p>

            <p className="text-sm text-gray-500 mt-1">
              You are within 70% of your monthly budget.
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                  Financial Health
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {report.financialHealth}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-xs font-bold text-green-600 uppercase mb-1">
                  Expense Ratio
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {report.expenseRatio?.toFixed(2)}%
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs font-bold text-purple-600 uppercase mb-1">
                  Monthly Surplus
                </p>

                <p className="text-lg font-bold text-gray-800">
                  ₹{report.monthlySurplus?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-bold mb-2">AI Recommendations</h4>

              <ul className="space-y-2 text-sm text-gray-600">
                {report.recommendations?.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;