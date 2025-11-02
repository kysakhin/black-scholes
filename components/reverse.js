"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Standard normal cumulative distribution function
function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Black-Scholes formula for European Call Option
function blackScholesCall(S, K, T, r, sigma) {
  if (T <= 0 || sigma <= 0) return 0;

  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callPrice = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);

  return {
    premium: callPrice,
    d1: d1,
    d2: d2,
    Nd1: normCDF(d1),
    Nd2: normCDF(d2),
    discountFactor: Math.exp(-r * T),
  };
}

export default function BlackScholesCalculator() {
  const [inputs, setInputs] = useState({
    S: 2500, // Stock price
    K: 2500, // Strike price
    T: 1, // Time in years
    r: 0.07, // Risk-free rate (7%)
    sigma: 0.25, // Volatility (25%)
  });

  const [result, setResult] = useState(null);
  const [sensitivityData, setSensitivityData] = useState([]);
  const [sensitivityType, setSensitivityType] = useState("S");

  const generateSensitivityData = () => {
    const data = [];
    const ranges = {
      S: { min: inputs.S * 0.7, max: inputs.S * 1.3, label: "Stock Price (₹)" },
      K: {
        min: inputs.K * 0.7,
        max: inputs.K * 1.3,
        label: "Strike Price (₹)",
      },
      T: { min: 0.1, max: 2, label: "Time to Expiry (years)" },
      r: { min: 0.01, max: 0.15, label: "Risk-free Rate" },
      sigma: { min: 0.05, max: 0.6, label: "Volatility" },
    };

    const range = ranges[sensitivityType];
    const steps = 50;
    const stepSize = (range.max - range.min) / steps;

    for (let i = 0; i <= steps; i++) {
      const value = range.min + i * stepSize;
      const testInputs = { ...inputs, [sensitivityType]: value };
      const res = blackScholesCall(
        testInputs.S,
        testInputs.K,
        testInputs.T,
        testInputs.r,
        testInputs.sigma
      );

      data.push({
        x: value,
        premium: res.premium,
        label: range.label,
      });
    }

    setSensitivityData(data);
  };

  useEffect(() => {
    const func = async () => {
      const res = blackScholesCall(
        inputs.S,
        inputs.K,
        inputs.T,
        inputs.r,
        inputs.sigma
      );
      setResult(res);
      generateSensitivityData();
    };

    func();
  }, [inputs, sensitivityType]);

  const handleInputChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  if (!result) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Black-Scholes Call Option Calculator
        </h1>
        <p className="text-center text-gray-400 mb-8">
          European Call Option Pricing Model
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">
              Input Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Stock Price (S): ₹{inputs.S.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="50"
                  value={inputs.S}
                  onChange={(e) => handleInputChange("S", e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Strike Price (K): ₹{inputs.K.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="50"
                  value={inputs.K}
                  onChange={(e) => handleInputChange("K", e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time to Expiration (T): {inputs.T.toFixed(2)} years (
                  {(inputs.T * 365).toFixed(0)} days)
                </label>
                <input
                  type="range"
                  min="0.08"
                  max="3"
                  step="0.08"
                  value={inputs.T}
                  onChange={(e) => handleInputChange("T", e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Risk-free Rate (r): {(inputs.r * 100).toFixed(2)}%
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={inputs.r}
                  onChange={(e) => handleInputChange("r", e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Volatility (σ): {(inputs.sigma * 100).toFixed(2)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.80"
                  step="0.01"
                  value={inputs.sigma}
                  onChange={(e) => handleInputChange("sigma", e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Results
            </h2>

            <div className="space-y-4">
              <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-4">
                <div className="text-sm text-blue-100">Call Option Premium</div>
                <div className="text-4xl font-bold">
                  ₹{result.premium.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Moneyness</div>
                  <div className="text-lg font-semibold">
                    {inputs.S > inputs.K
                      ? "🟢 ITM"
                      : inputs.S < inputs.K
                      ? "🔴 OTM"
                      : "🟡 ATM"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {inputs.S > inputs.K
                      ? "In the Money"
                      : inputs.S < inputs.K
                      ? "Out of the Money"
                      : "At the Money"}
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Discount Factor</div>
                  <div className="text-lg font-semibold">
                    {result.discountFactor.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    e^(-rT) = e^(-{(inputs.r * inputs.T).toFixed(4)})
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-300">
                  Formula Breakdown
                </h3>
                <div className="text-xs space-y-1 font-mono text-gray-400">
                  <div>d₁ = {result.d1.toFixed(4)}</div>
                  <div>d₂ = {result.d2.toFixed(4)}</div>
                  <div>N(d₁) = {result.Nd1.toFixed(4)}</div>
                  <div>N(d₂) = {result.Nd2.toFixed(4)}</div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-300">
                  Present Value Components
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stock value: S₀N(d₁)</span>
                    <span className="font-semibold">
                      ₹{(inputs.S * result.Nd1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Strike value: Ke^(-rT)N(d₂)
                    </span>
                    <span className="font-semibold">
                      ₹
                      {(inputs.K * result.discountFactor * result.Nd2).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 flex justify-between">
                    <span className="text-gray-400">
                      Call Premium (difference)
                    </span>
                    <span className="font-bold text-green-400">
                      ₹{result.premium.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity Chart */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-green-300">
              Sensitivity Analysis
            </h2>
            <select
              value={sensitivityType}
              onChange={(e) => setSensitivityType(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
            >
              <option value="S">Stock Price</option>
              <option value="K">Strike Price</option>
              <option value="T">Time to Expiration</option>
              <option value="r">Risk-free Rate</option>
              <option value="sigma">Volatility</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensitivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="x"
                stroke="#9CA3AF"
                label={{
                  value: sensitivityData[0]?.label || "",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#9CA3AF",
                }}
              />
              <YAxis
                stroke="#9CA3AF"
                label={{
                  value: "Premium (₹)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9CA3AF",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="premium"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Educational Info */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-3 text-yellow-300">
            💡 What This Means
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong className="text-blue-300">Call Premium:</strong> The price
              you pay TODAY to buy the option contract.
            </p>
            <p>
              <strong className="text-blue-300">Discount Factor:</strong>{" "}
              Converts the future strike price to present value (smaller = more
              discounting).
            </p>
            <p>
              <strong className="text-blue-300">N(d₂):</strong> Approximate
              probability the option expires in-the-money (≈
              {(result.Nd2 * 100).toFixed(1)}%).
            </p>
            <p>
              <strong className="text-blue-300">Formula:</strong> C = S₀N(d₁) -
              Ke^(-rT)N(d₂) = (Stock Value) - (Discounted Strike Value)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
