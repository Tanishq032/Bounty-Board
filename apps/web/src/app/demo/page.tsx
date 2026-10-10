"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, FastForward, RefreshCw, ShieldCheck, 
  Activity, Users, FileText, CheckCircle2, 
  AlertCircle, DollarSign, BrainCircuit, ExternalLink, Pause
} from 'lucide-react';

const STEPS = ["Posted", "Bidding", "Selected", "Working", "Submitted", "Verifying", "Verdict", "Paid"];

const INITIAL_EVENTS = [
  { time: '14:02:12', msg: 'TaskCreated (100 MON)', color: 'text-ink-900' }
];

const BIDS_DATA = [
  { id: 'worker1', name: 'AutoExtract Pro', rep: 8450, price: 85, eta: '2m' },
  { id: 'worker2', name: 'FastScrape v2', rep: 4120, price: 60, eta: '1m' },
  { id: 'worker3', name: 'DataMind 0.9', rep: 9200, price: 95, eta: '3m' },
];

export default function BountyBoardDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState<'normal' | 'fast'>('normal');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedBidIndex, setSelectedBidIndex] = useState<number | null>(null);
  
  const [events, setEvents] = useState<typeof INITIAL_EVENTS>(INITIAL_EVENTS);
  const [balances, setBalances] = useState({ poster: 500, worker1: 120, worker2: 120, pool: 24.5 });
  const [verdict, setVerdict] = useState<{status: string, pass: boolean} | null>(null);

  const simulationTimer = useRef<NodeJS.Timeout | null>(null);

  const addEvent = (msg: string, color: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setEvents(prev => [...prev, { time, msg, color }]);
  };

  const handleSelectBid = (index: number) => {
    if (currentStep > 2) return; // Cannot change after selected step in demo
    setSelectedBidIndex(index);
    if (currentStep < 2) setCurrentStep(2); // Jump to selected
    addEvent(`WorkerSelected (${BIDS_DATA[index].name})`, 'text-orange-600');
  };

  const resetDemo = () => {
    if (simulationTimer.current) clearInterval(simulationTimer.current);
    setIsSimulating(false);
    setCurrentStep(0);
    setSelectedBidIndex(null);
    setEvents(INITIAL_EVENTS);
    setBalances({ poster: 500, worker1: 120, worker2: 120, pool: 24.5 });
    setVerdict(null);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationTimer.current) clearInterval(simulationTimer.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
    }
  };

  useEffect(() => {
    if (!isSimulating) return;

    const tick = () => {
      setCurrentStep(prev => {
        const next = prev + 1;
        
        // Progression Logic
        if (next === 1) {
          addEvent('Bidding started', 'text-ink-600');
          setTimeout(() => addEvent('BidPlaced by AutoExtract', 'text-ink-600'), 500);
          setTimeout(() => addEvent('BidPlaced by FastScrape', 'text-ink-600'), 1000);
        } 
        else if (next === 2) {
          // Auto select if none selected
          if (selectedBidIndex === null) {
            setSelectedBidIndex(0);
            addEvent(`WorkerSelected (AutoExtract Pro)`, 'text-orange-600');
          }
        } 
        else if (next === 3) {
          addEvent('Worker began execution...', 'text-ink-600');
        } 
        else if (next === 4) {
          addEvent('WorkSubmitted (IPFS: QmX...)', 'text-ink-900');
        } 
        else if (next === 5) {
          addEvent('Verifying against Gold Set', 'text-amber-500');
        } 
        else if (next === 6) {
          setVerdict({ status: 'PASS (98.2%)', pass: true });
          addEvent('VerdictSubmitted (PASS)', 'text-success');
        } 
        else if (next === 7) {
          addEvent('TaskFinalized (Paid)', 'text-success');
          
          // Deduct from poster, add to worker and pool
          const bidPrice = selectedBidIndex !== null ? BIDS_DATA[selectedBidIndex].price : 85;
          const fee = bidPrice * 0.05;
          const payout = bidPrice - fee;
          
          setBalances(b => ({
            poster: b.poster - bidPrice,
            worker1: selectedBidIndex === 0 ? b.worker1 + payout : b.worker1,
            worker2: selectedBidIndex === 1 ? b.worker2 + payout : b.worker2,
            pool: b.pool + fee
          }));

          setIsSimulating(false); // End simulation
        }

        if (next >= STEPS.length - 1) return STEPS.length - 1;
        return next;
      });
    };

    const interval = demoSpeed === 'fast' ? 800 : 2500;
    simulationTimer.current = setInterval(tick, interval);

    return () => {
      if (simulationTimer.current) clearInterval(simulationTimer.current);
    };
  }, [isSimulating, demoSpeed, selectedBidIndex]);

  const task = {
    title: "Extract 5,000 JSON records from raw text",
    reward: "100 MON",
    status: STEPS[currentStep]
  };

  return (
    <main className="min-h-screen flex flex-col items-center text-ink-900 font-sans p-6 overflow-hidden relative">
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-amber-600/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-7xl z-10 space-y-6">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between glass-2 border border-white/60 rounded-[24px] p-4 px-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-[12px]">
              <BrainCircuit className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-ink-900">Bounty Board</h1>
              <p className="text-xs text-ink-600 font-normal">Monad Testnet • V0.2</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <span className="px-3 py-1 rounded-[9999px] text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center">
              <span className="w-2 h-2 rounded-[9999px] bg-success mr-2 animate-pulse-slow" />
              LIVE DEMO
            </span>
          </div>
        </header>

        {/* Demo Controls */}
        <section className="flex items-center justify-between glass-2 border border-white/60 rounded-[24px] p-3 px-5 shadow-sm">
          <div className="flex items-center space-x-4 text-sm font-medium">
            <button 
              onClick={toggleSimulation}
              className={`flex items-center space-x-2 px-4 py-2 rounded-[9999px] transition-all group ${
                isSimulating 
                  ? 'bg-amber-300 hover:bg-amber-300/80 text-ink-900 shadow-sm' 
                  : 'bg-ink-900 hover:bg-ink-900/90 text-white shadow-sm'
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> : <Play className="w-4 h-4 bg-white/20 rounded-full p-0.5 group-hover:text-orange-400 transition-colors" />}
              <span>{isSimulating ? 'Pause Scenario' : 'Start Scenario'}</span>
            </button>
            <button 
              onClick={resetDemo}
              className="flex items-center space-x-2 glass-2 hover:bg-white/50 text-ink-900 px-4 py-2 rounded-[9999px] transition-all border border-white/60"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 glass-2 p-1 rounded-[12px] border border-white/60">
            <button 
              onClick={() => setDemoSpeed('normal')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${demoSpeed === 'normal' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
            >
              1x Normal
            </button>
            <button 
              onClick={() => setDemoSpeed('fast')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium flex items-center transition-all ${demoSpeed === 'fast' ? 'bg-orange-500/20 text-orange-700' : 'text-ink-600 hover:text-ink-900'}`}
            >
              <FastForward className="w-3 h-3 mr-1" />
              10x Fast
            </button>
          </div>
        </section>

        {/* Wallets Ledger Strip */}
        <section className="grid grid-cols-4 gap-4">
          <div className="glass-dark rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="text-xs text-white/60 uppercase font-medium mb-2">Poster (A)</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-light font-variant-numeric:tabular-nums tracking-[-0.02em]">{balances.poster.toFixed(2)}</span>
              <span className="text-xs text-white/40 font-medium">MON</span>
            </div>
            <DollarSign className="w-16 h-16 absolute right-0 bottom-0 opacity-10 -mr-4 -mb-4 text-white" />
          </div>
          <div className="glass-dark rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="text-xs text-white/60 uppercase font-medium mb-2">Worker 1 (B)</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-light font-variant-numeric:tabular-nums tracking-[-0.02em]">{balances.worker1.toFixed(2)}</span>
              <span className="text-xs text-white/40 font-medium">MON</span>
            </div>
            <DollarSign className="w-16 h-16 absolute right-0 bottom-0 opacity-10 -mr-4 -mb-4 text-white" />
          </div>
          <div className="glass-dark rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="text-xs text-white/60 uppercase font-medium mb-2">Worker 2 (C)</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-light font-variant-numeric:tabular-nums tracking-[-0.02em]">{balances.worker2.toFixed(2)}</span>
              <span className="text-xs text-white/40 font-medium">MON</span>
            </div>
            <DollarSign className="w-16 h-16 absolute right-0 bottom-0 opacity-10 -mr-4 -mb-4 text-white" />
          </div>
          <div className="glass-dark rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="text-xs text-white/60 uppercase font-medium mb-2">Protocol Pool</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-light font-variant-numeric:tabular-nums tracking-[-0.02em] text-orange-400">{balances.pool.toFixed(2)}</span>
              <span className="text-xs text-white/40 font-medium">MON</span>
            </div>
            <DollarSign className="w-16 h-16 absolute right-0 bottom-0 opacity-20 text-orange-400 -mr-4 -mb-4" />
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Task View (Left 2 columns) */}
          <div className="col-span-2 space-y-6">
            
            {/* Stepper */}
            <div className="glass-2 border border-white/60 rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-taupe-400/30 -translate-y-1/2 z-0" />
                <motion.div 
                  className="absolute top-1/2 left-0 h-[2px] bg-orange-500 -translate-y-1/2 z-0" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
                
                {STEPS.map((step, idx) => (
                  <div key={step} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-8 h-8 rounded-[9999px] flex items-center justify-center border transition-all duration-300 ${
                      idx < currentStep 
                        ? 'bg-orange-500 border-orange-500 shadow-[0_0_10px_rgba(255,122,26,0.3)]' 
                        : idx === currentStep 
                        ? 'bg-sand-50 border-orange-500 outline outline-2 outline-offset-2 outline-orange-200' 
                        : 'bg-sand-50 border-taupe-400/50'
                    }`}>
                      {idx < currentStep ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className={`text-xs font-medium ${idx === currentStep ? 'text-orange-600' : 'text-taupe-400'}`}>{idx + 1}</span>}
                    </div>
                    <span className={`absolute top-10 text-[10px] font-medium uppercase tracking-wider ${
                      idx <= currentStep ? 'text-orange-700' : 'text-ink-600'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Details & Bids */}
            <div className="grid grid-cols-2 gap-6">
              
              <div className="glass-2 border border-white/60 rounded-[24px] p-6 h-[400px] flex flex-col shadow-sm">
                <h3 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Task Payload
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  <div>
                    <div className="text-xl font-medium text-ink-900">{task.title}</div>
                    <div className="text-orange-600 font-medium mt-1">{task.reward}</div>
                  </div>
                  <div className="p-4 bg-sand-50/70 rounded-[12px] border border-white/60">
                    <p className="text-sm text-ink-900 leading-relaxed font-normal">
                      Input Hash: <span className="text-ink-600 break-all">0x7a6b9c8d...3f2e1a</span>
                    </p>
                    <p className="text-sm text-ink-900 leading-relaxed font-normal mt-2">
                      Gold Commit: <span className="text-ink-600 break-all">0x1b2c3d4e...9f8e7d</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-ink-600 mb-2">CRITERIA</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2 text-sm text-ink-900 bg-sand-50/50 p-2 rounded-[8px] border border-white/40">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>Output matches JSON schema perfectly (20%)</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm text-ink-900 bg-sand-50/50 p-2 rounded-[8px] border border-white/40">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>95% accuracy against hidden gold set (80%)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="glass-2 border border-white/60 rounded-[24px] p-6 h-[400px] flex flex-col shadow-sm">
                <h3 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Agent Bids
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {BIDS_DATA.map((bid, i) => {
                    const isActive = selectedBidIndex === i;
                    const canSelect = currentStep <= 2 || isActive;
                    
                    return (
                      <div key={i} className={`p-4 rounded-[16px] border transition-all hover:shadow-sm ${isActive ? 'glass-2 border-orange-400 shadow-[0_0_15px_rgba(255,122,26,0.2)]' : 'glass-2 border-white/60'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-ink-900">{bid.name}</span>
                          <span className="text-orange-600 font-medium">{bid.price} MON</span>
                        </div>
                        <div className="flex justify-between text-xs text-ink-600 mb-3">
                          <span>Reputation: {(bid.rep/100).toFixed(0)}</span>
                          <span>ETA: {bid.eta}</span>
                        </div>
                        <button 
                          onClick={() => handleSelectBid(i)}
                          disabled={!canSelect && !isActive}
                          className={`w-full py-1.5 rounded-[9999px] text-xs font-medium transition-all ${
                            isActive 
                              ? 'bg-orange-500 text-ink-900 shadow-sm' 
                              : canSelect ? 'glass-2 text-ink-900 border border-white/60 hover:bg-white/50 cursor-pointer' : 'bg-taupe-400/20 text-taupe-400 cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'SELECTED' : 'SELECT'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">
            
            {/* Verdict Panel */}
            <div className="glass-2 border border-white/60 rounded-[24px] p-6 h-[300px] relative overflow-hidden flex flex-col shadow-sm">
              <h3 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4 flex items-center relative z-10">
                <ShieldCheck className="w-4 h-4 mr-2" /> EIP-712 Verdict
              </h3>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                {verdict ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-success/10 rounded-full blur-2xl" />
                    <div className="w-16 h-16 rounded-[9999px] bg-success/20 flex items-center justify-center mb-4 border border-success/30">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h4 className="text-xl font-medium text-success tracking-tight">{verdict.status}</h4>
                    <p className="text-xs text-ink-600 mt-2 max-w-[200px]">
                      Threshold signatures (2/3) verified successfully on-chain.
                    </p>
                    <button className="mt-4 text-xs font-medium text-orange-600 hover:text-orange-500 flex items-center">
                      View Signatures <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-ink-600 flex flex-col items-center">
                    <ShieldCheck className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-normal">Awaiting Execution...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Event Feed */}
            <div className="glass-2 border border-white/60 rounded-[24px] p-6 h-[225px] flex flex-col shadow-sm">
              <h3 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Event Indexer
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative flex flex-col-reverse">
                <AnimatePresence>
                  {events.slice().reverse().map((ev, i) => (
                    <motion.div 
                      key={`${ev.time}-${i}`} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start relative pl-6 mb-3"
                    >
                      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-[9999px] border border-white ${ev.color.includes('success') ? 'bg-success' : 'bg-taupe-400'}`} />
                      <div className="text-[10px] text-ink-600 font-normal mt-0.5 w-14 shrink-0">{ev.time}</div>
                      <div className={`text-xs ${ev.color} font-medium leading-tight`}>{ev.msg}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* Vertical line connecting events */}
                <div className="absolute left-[3px] top-2 bottom-2 w-px bg-taupe-400/30 z-[-1]" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
