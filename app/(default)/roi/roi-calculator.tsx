'use client'

import { useMemo, useState } from 'react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export default function RoiCalculator() {
  const [teamMembers, setTeamMembers] = useState(12)
  const [runsPerWeek, setRunsPerWeek] = useState(40)
  const [avgMinutes, setAvgMinutes] = useState(18)
  const [hourlyCost, setHourlyCost] = useState(60)
  const [savingsRate, setSavingsRate] = useState(0.3)

  const results = useMemo(() => {
    const weeklyMinutes = runsPerWeek * avgMinutes
    const monthlyHours = (weeklyMinutes * 4.33) / 60
    const monthlyHoursSaved = monthlyHours * savingsRate
    const monthlySavings = monthlyHoursSaved * hourlyCost
    const annualSavings = monthlySavings * 12
    const hoursPerPerson = teamMembers > 0 ? monthlyHoursSaved / teamMembers : 0

    return {
      monthlyHours,
      monthlyHoursSaved,
      monthlySavings,
      annualSavings,
      hoursPerPerson,
    }
  }, [avgMinutes, hourlyCost, runsPerWeek, savingsRate, teamMembers])

  const currentMonthlyCost = results.monthlyHours * hourlyCost
  const projectedMonthlyCost = Math.max(currentMonthlyCost - results.monthlySavings, 0)
  const chartData = [
    { label: 'Current cost', value: currentMonthlyCost, color: 'bg-slate-200' },
    { label: 'Savings', value: results.monthlySavings, color: 'bg-[#1861C8]' },
    { label: 'Projected cost', value: projectedMonthlyCost, color: 'bg-[#61AFF9]' },
  ]
  const chartMax = Math.max(...chartData.map((item) => item.value), 1)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Model your workflow impact</h2>
        <p className="mt-2 text-sm text-slate-600">
          Adjust the inputs to match your team. This model estimates labor savings from guided workflows.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            Team members running the workflow
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              value={teamMembers}
              onChange={(event) => setTeamMembers(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Runs per week
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              value={runsPerWeek}
              onChange={(event) => setRunsPerWeek(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Avg minutes per run
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              value={avgMinutes}
              onChange={(event) => setAvgMinutes(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Fully loaded hourly cost ($)
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              value={hourlyCost}
              onChange={(event) => setHourlyCost(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600 sm:col-span-2">
            Estimated time savings (%)
            <input
              type="range"
              min={0.1}
              max={0.7}
              step={0.05}
              className="w-full"
              value={savingsRate}
              onChange={(event) => setSavingsRate(Number(event.target.value))}
            />
            <div className="text-xs text-slate-500">{Math.round(savingsRate * 100)}% time savings</div>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Estimated impact</h3>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Monthly hours spent today</span>
            <span className="font-semibold text-slate-900">{results.monthlyHours.toFixed(1)} hrs</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Monthly hours saved</span>
            <span className="font-semibold text-slate-900">{results.monthlyHoursSaved.toFixed(1)} hrs</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Monthly savings</span>
            <span className="font-semibold text-slate-900">{formatCurrency(results.monthlySavings)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Annual savings</span>
            <span className="font-semibold text-slate-900">{formatCurrency(results.annualSavings)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Hours saved per team member</span>
            <span className="font-semibold text-slate-900">{results.hoursPerPerson.toFixed(1)} hrs/mo</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Monthly impact</div>
          <div className="mt-3 flex items-end gap-4 h-28">
            {chartData.map((item) => (
              <div key={item.label} className="flex-1">
                <div
                  className={`w-full rounded-xl ${item.color}`}
                  style={{ height: `${Math.max(12, Math.round((item.value / chartMax) * 100))}%` }}
                />
                <div className="mt-2 text-[11px] text-slate-500">{item.label}</div>
                <div className="text-xs font-semibold text-slate-700">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          These estimates assume workflow guidance reduces task time and rework. Use pilot data to replace assumptions with
          real measurements.
        </div>
      </div>
    </div>
  )
}
