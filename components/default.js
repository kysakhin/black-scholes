"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) {
    prob = 1 - prob;
  }
  return prob;
}

function blackScholesCall(S, K, T, r, sigma) {
  if (T <= 0 || sigma <= 0) return 0;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
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

function ParameterSlider({ label, field, min, max, step, format, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-900">{format(value)}</span>
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange({ target: { value: e.target.value } })}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>
    </div>
  );
}

export default function DefaultPage() {
  const [inputs, setInputs] = useState({
    S: 2500,
    K: 2400,
    T: 1,
    r: 0.05,
    sigma: 0.2,
  });

  const result = useMemo(() => {
    return blackScholesCall(inputs.S, inputs.K, inputs.T, inputs.r, inputs.sigma);
  }, [inputs]);

  // Chart data: premium vs spot price across a reasonable range
  const chartData = useMemo(() => {
    const points = 60;
    const min = Math.max(0.1, inputs.S * 0.5);
    const max = inputs.S * 1.5;
    const step = (max - min) / (points - 1);
    const data = [];
    for (let i = 0; i < points; i++) {
      const spot = min + i * step;
      const p = blackScholesCall(spot, inputs.K, inputs.T, inputs.r, inputs.sigma);
      data.push({ spot: Math.round(spot), premium: Number(p.premium.toFixed(2)) });
    }
    return data;
  }, [inputs]);

  const update = (field, value) => {
    setInputs((s) => ({ ...s, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Black–Scholes Call Pricing</h1>
            <p className="mt-1 text-sm text-gray-600">Interactive calculator with real-time visualization</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Call Premium</p>
            <p className="text-2xl font-bold text-blue-600">${result.premium.toFixed(2)}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Parameters</h2>
            <div className="space-y-6">
              <ParameterSlider
                label="Spot Price (S)"
                min={0}
                max={5000}
                step={1}
                value={inputs.S}
                onChange={(e) => update("S", Number(e.target.value))}
                format={(v) => `$${v}`}
              />
              <ParameterSlider
                label="Strike Price (K)"
                min={0}
                max={5000}
                step={1}
                value={inputs.K}
                onChange={(e) => update("K", Number(e.target.value))}
                format={(v) => `$${v}`}
              />
              <ParameterSlider
                label="Time to Maturity (T, years)"
                min={0.01}
                max={5}
                step={0.01}
                value={inputs.T}
                onChange={(e) => update("T", Number(e.target.value))}
                format={(v) => v.toFixed(2)}
              />
              <ParameterSlider
                label="Risk-free Rate (r)"
                min={0}
                max={0.2}
                step={0.0005}
                value={inputs.r}
                onChange={(e) => update("r", Number(e.target.value))}
                format={(v) => `${(v * 100).toFixed(2)}%`}
              />
              <ParameterSlider
                label="Volatility (σ)"
                min={0.01}
                max={1}
                step={0.005}
                value={inputs.sigma}
                onChange={(e) => update("sigma", Number(e.target.value))}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
            </div>
          </div>

          {/* Chart & Results Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Premium vs. Spot Price</h2>
            <div className="w-full h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="spot" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(v) => `$${v.toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="premium" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Premium</p>
                <p className="text-lg font-bold text-gray-900 mt-1">${result.premium.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Discount Factor</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{result.discountFactor.toFixed(4)}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">N(d1)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{result.Nd1.toFixed(4)}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">N(d2)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{result.Nd2.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
