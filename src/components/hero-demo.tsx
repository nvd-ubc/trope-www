'use client'

import { useState, useEffect, useCallback } from 'react'

export default function HeroDemo() {
  const [isHovered, setIsHovered] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'guiding' | 'automating' | 'complete'>('idle')
  const [step, setStep] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 28, y: 44 })
  const [isClicking, setIsClicking] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [automationProgress, setAutomationProgress] = useState(0)
  const [windowVisible, setWindowVisible] = useState(false) // Starts hidden, animates in on "Open" step
  const [dataVisible, setDataVisible] = useState({ b12: false, b15: false }) // Track cell data visibility separately

  // Step 0: "Open file" - window animates in, no cursor
  // Steps 1-3: Cursor interactions with cells
  const recordingSteps = [
    { action: 'Open Q3 Report.xlsx', x: null, y: null },  // No cursor - window opens
    { action: 'Navigate to cell B12', x: 28, y: 44 },     // Cell B12 (row 12 is ~44% down)
    { action: 'Enter revenue data', x: 28, y: 44 },       // Stay on B12
    { action: 'Apply SUM formula', x: 28, y: 75 },        // Cell B15 (row 15 is ~75% down)
  ]

  const resetAnimation = useCallback(() => {
    setPhase('idle')
    setStep(0)
    setCursorPos({ x: 28, y: 44 })
    setShowOverlay(false)
    setAutomationProgress(0)
    setWindowVisible(false)
    setDataVisible({ b12: false, b15: false })
  }, [])

  const startAnimation = useCallback(() => {
    if (phase !== 'idle') return
    setWindowVisible(true) // Window animates in for "Open" step
    setPhase('recording')
    setHasPlayedOnce(true)
  }, [phase])

  // Start animation on hover (only if idle)
  useEffect(() => {
    if (isHovered && phase === 'idle') {
      startAnimation()
    }
  }, [isHovered, phase, startAnimation])

  // Auto-play continuously
  useEffect(() => {
    if (phase === 'idle') {
      const timeout = setTimeout(() => {
        startAnimation()
      }, hasPlayedOnce ? 2000 : 400) // First play triggers quickly
      return () => clearTimeout(timeout)
    }
  }, [phase, hasPlayedOnce, startAnimation])

  // Animation loop
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') return

    const interval = setInterval(() => {
      if (phase === 'recording') {
        if (step < recordingSteps.length) {
          const nextStep = recordingSteps[step]
          // Step 0 is "Open file" - no cursor, just window appearing
          // Steps 1+ have cursor interactions
          if (nextStep.x !== null && nextStep.y !== null) {
            setCursorPos({ x: nextStep.x, y: nextStep.y })
            setTimeout(() => {
              setIsClicking(true)
              setTimeout(() => setIsClicking(false), 150)
            }, 400)
          }

          // Show data in cells after the relevant steps
          // Step 2 = "Enter revenue data" -> show B12 data after click
          if (step === 2) {
            setTimeout(() => setDataVisible(d => ({ ...d, b12: true })), 600)
          }
          // Step 3 = "Apply SUM formula" -> show B15 formula after click
          if (step === 3) {
            setTimeout(() => setDataVisible(d => ({ ...d, b15: true })), 600)
          }

          setStep(s => s + 1)
        } else {
          setTimeout(() => {
            setPhase('guiding')
            setStep(0)
            setShowOverlay(true)
            // Reset data so it can appear again during guidance
            setDataVisible({ b12: false, b15: false })
          }, 800)
        }
      } else if (phase === 'guiding') {
        if (step < 4) {
          // Step 0: "Enter revenue data" tooltip shown, B12 data appears
          if (step === 0) {
            setTimeout(() => setDataVisible(d => ({ ...d, b12: true })), 600)
          }
          // Step 2: Tooltip switches to "Calculate total", B15 formula appears
          if (step === 2) {
            setTimeout(() => setDataVisible(d => ({ ...d, b15: true })), 600)
          }
          setStep(s => s + 1)
        } else {
          setTimeout(() => {
            setPhase('automating')
            setStep(0)
            setShowOverlay(false)
          }, 1000)
        }
      } else if (phase === 'automating') {
        if (automationProgress < 100) {
          setAutomationProgress(p => Math.min(p + 25, 100))
        } else {
          setPhase('complete')
          setTimeout(() => {
            resetAnimation()
          }, 2000)
        }
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [phase, step, automationProgress, resetAnimation])

  const isActive = phase !== 'idle'

  return (
    <div
      className="relative w-full max-w-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={startAnimation}
    >
      {/* Glow behind the demo */}
      <div className={`absolute inset-0 bg-[#1861C8]/5 rounded-3xl blur-2xl transform transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`} />

      {/* Main demo container - animates in on "Open" step */}
      <div className={`relative bg-white border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isActive ? 'border-slate-300' : 'border-slate-200'} ${windowVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>


        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-slate-600 text-xs">
              Q3_Financial_Report.xlsx
            </div>
          </div>
          {/* Status indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all duration-300 ${
            phase === 'recording'
              ? 'bg-red-500/20 text-red-600'
              : phase === 'guiding'
              ? 'bg-[#1861C8]/20 text-[#1861C8]'
              : phase === 'automating'
              ? 'bg-green-500/20 text-green-600'
              : 'bg-slate-100 text-slate-500'
          }`}>
            <span className={`w-2 h-2 rounded-full transition-colors ${
              phase === 'recording'
                ? 'bg-red-500 animate-pulse'
                : phase === 'guiding'
                ? 'bg-[#1861C8]'
                : phase === 'automating'
                ? 'bg-green-500'
                : 'bg-slate-400'
            }`} />
            {phase === 'idle' ? 'Ready' : phase === 'recording' ? 'Recording' : phase === 'guiding' ? 'Guiding' : phase === 'complete' ? 'Done' : 'Automating'}
          </div>
        </div>

        {/* Spreadsheet content */}
        <div className="relative h-64 bg-slate-50">
          {/* Excel-like grid */}
          <div className="absolute inset-0 p-2">
            {/* Column headers */}
            <div className="flex border-b border-slate-200 mb-1">
              <div className="w-8 h-6 flex items-center justify-center text-[10px] text-slate-400" />
              {['A', 'B', 'C', 'D', 'E'].map(col => (
                <div key={col} className="w-16 h-6 flex items-center justify-center text-[10px] text-slate-500 border-r border-slate-200">
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {[10, 11, 12, 13, 14, 15].map((row) => (
              <div key={row} className="flex border-b border-slate-200/50">
                <div className="w-8 h-7 flex items-center justify-center text-[10px] text-slate-400">
                  {row}
                </div>
                {['A', 'B', 'C', 'D', 'E'].map(col => {
                  // Cells are "active" (highlighted bg) when they have data entered
                  const isActive = (col === 'B' && row === 12 && dataVisible.b12) ||
                                   (col === 'B' && row === 15 && dataVisible.b15)
                  // Ring highlight during guidance phase
                  const isHighlighted = showOverlay && col === 'B' && (
                    (row === 12 && step < 2) || (row === 15 && step >= 2 && step < 4)
                  )
                  return (
                    <div
                      key={col}
                      className={`w-16 h-7 flex items-center justify-center text-[10px] border-r border-slate-200/50 transition-all duration-300 ${
                        isActive ? 'bg-[#1861C8]/10 text-slate-900' : 'text-slate-600'
                      } ${isHighlighted ? 'ring-2 ring-[#1861C8] ring-offset-1 ring-offset-slate-50' : ''}`}
                    >
                      {col === 'A' && row === 10 && 'Region'}
                      {col === 'B' && row === 10 && 'Revenue'}
                      {col === 'C' && row === 10 && 'Costs'}
                      {col === 'A' && row === 11 && 'North'}
                      {col === 'B' && row === 11 && '$42,500'}
                      {col === 'A' && row === 12 && 'South'}
                      {col === 'B' && row === 12 && dataVisible.b12 && (
                        <span className="animate-fade-in">$38,200</span>
                      )}
                      {col === 'A' && row === 13 && 'East'}
                      {col === 'B' && row === 13 && '$51,800'}
                      {col === 'A' && row === 14 && 'West'}
                      {col === 'B' && row === 14 && '$44,100'}
                      {col === 'A' && row === 15 && <span className="font-medium">Total</span>}
                      {col === 'B' && row === 15 && dataVisible.b15 && (
                        <span className="font-medium text-[#1861C8] animate-fade-in">=SUM(B11:B14)</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Animated cursor - only shows after step 0 (the "Open" step) */}
          {phase === 'recording' && step > 0 && (
            <div
              className="absolute transition-all duration-500 ease-out pointer-events-none z-20"
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg
                className={`w-5 h-5 text-slate-800 drop-shadow-lg transition-transform duration-150 ${isClicking ? 'scale-90' : 'scale-100'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 4l16 8-7 2-2 7z" />
              </svg>
              {isClicking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#1861C8]/30 animate-ping" />
                </div>
              )}
            </div>
          )}

          {/* Guidance overlay tooltips - cycles through steps */}
          {showOverlay && (
            <>
              {/* Step 1: Enter revenue data (cell B12) - shows for steps 0-1 */}
              {step < 2 && (
                <div className="absolute left-[18%] top-[5%] z-30 animate-fade-in" key="guidance-1">
                  <div className="bg-[#1861C8] text-white px-4 py-3 rounded-xl shadow-xl max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <span className="text-xs font-medium">Enter revenue data</span>
                    </div>
                    <p className="text-[10px] text-white/70">
                      Type the Q3 revenue for the South region
                    </p>
                    <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#1861C8]" />
                  </div>
                </div>
              )}
              {/* Step 2: Apply SUM formula (cell B15) - shows for steps 2-3 */}
              {step >= 2 && step < 4 && (
                <div className="absolute left-[18%] top-[38%] z-30 animate-fade-in" key="guidance-2">
                  <div className="bg-[#1861C8] text-white px-4 py-3 rounded-xl shadow-xl max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <span className="text-xs font-medium">Calculate total</span>
                    </div>
                    <p className="text-[10px] text-white/70">
                      Apply SUM formula to get the total revenue
                    </p>
                    <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#1861C8]" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Automation progress overlay */}
          {phase === 'automating' && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-30 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1861C8]/10 flex items-center justify-center">
                  {automationProgress < 100 ? (
                    <svg className="w-8 h-8 text-[#1861C8] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-slate-900 font-medium text-sm mb-2">
                  {automationProgress < 100 ? 'Running automation...' : 'Workflow complete!'}
                </p>
                <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1861C8] to-[#61AFF9] transition-all duration-500 rounded-full"
                    style={{ width: `${automationProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Steps panel - fixed height to prevent layout jumps */}
        <div className="p-4 bg-slate-100 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Captured steps</span>
            <span className="text-xs text-[#1861C8]">{Math.min(step, recordingSteps.length)} of {recordingSteps.length}</span>
          </div>
          {/* Fixed height container for all 4 steps */}
          <div className="space-y-2 h-[168px]">
            {recordingSteps.map((s, idx) => {
              const isVisible = idx < Math.min(step, recordingSteps.length)
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ease-out ${
                    isVisible
                      ? 'bg-white opacity-100 translate-y-0 shadow-sm'
                      : 'bg-transparent opacity-0 translate-y-2'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isVisible ? 'bg-[#1861C8]' : 'bg-slate-200'
                  }`}>
                    {isVisible && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors duration-300 ${
                    isVisible ? 'text-slate-700' : 'text-slate-400'
                  }`}>{s.action}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Phase indicator pills */}
      <div className="flex justify-center gap-2 mt-4">
        {(['recording', 'guiding', 'automating'] as const).map((p) => (
          <div
            key={p}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              phase === p
                ? 'bg-[#1861C8] text-white'
                : phase === 'complete' || (phase !== 'idle' && ['recording', 'guiding', 'automating'].indexOf(p) < ['recording', 'guiding', 'automating'].indexOf(phase as 'recording' | 'guiding' | 'automating'))
                ? 'bg-[#1861C8]/30 text-[#1861C8]'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {p === 'recording' ? 'Record' : p === 'guiding' ? 'Guide' : 'Automate'}
          </div>
        ))}
      </div>
    </div>
  )
}
