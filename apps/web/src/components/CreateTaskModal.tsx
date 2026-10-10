import React, { useState } from 'react';
import { X, Plus, Calendar, Coins, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { publicClient, getWalletClient } from '@/lib/contract';
import { parseEther, keccak256, toBytes } from 'viem';
import BountyBoardAbi from '@/lib/BountyBoard.abi.json';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string; reward: number; deadline: string }) => Promise<void>;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('text-extraction');
  
  const [inputsText, setInputsText] = useState('');
  const [criteria, setCriteria] = useState([{ description: '', points: 10 }]);
  const [goldSetText, setGoldSetText] = useState('');
  
  const [reward, setReward] = useState('');
  const [biddingDeadline, setBiddingDeadline] = useState('');
  const [executionDeadline, setExecutionDeadline] = useState('');
  const [selectionMode, setSelectionMode] = useState('0'); // 0 = Manual, 1 = Reputation
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const addCriterion = () => setCriteria([...criteria, { description: '', points: 10 }]);
  const updateCriterion = (index: number, field: string, value: string | number) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reward || !executionDeadline || !biddingDeadline) return;

    setIsSubmitting(true);
    try {
      // Step 1: Upload gold set privately to backend vault
      const goldSetResponse = await fetch('http://localhost:3001/tasks/gold-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goldSet: goldSetText })
      });
      const { goldCommitment } = await goldSetResponse.json();

      // Step 2: Upload inputs & criteria to backend (payload)
      const payloadResponse = await fetch('http://localhost:3001/tasks/payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: { title, description, template, inputsText, criteria } 
        })
      });
      const { inputHash } = await payloadResponse.json();

      // Compute criteriaHash locally (or get from backend)
      const criteriaString = JSON.stringify(criteria);
      const criteriaHash = keccak256(toBytes(criteriaString));
      
      const goldHashBytes32 = keccak256(toBytes(goldCommitment));
      const inputHashBytes32 = keccak256(toBytes(inputHash));

      // Step 3: Call smart contract
      const walletClient = await getWalletClient();
      const [account] = await walletClient.getAddresses();
      
      const BOUNTY_BOARD_ADDRESS = '0xb95aaf93f88d0b26e0153e27a8bbc0d1be8d2e01';
      const parsedReward = parseEther(reward);
      
      const execTime = BigInt(Math.floor(new Date(executionDeadline).getTime() / 1000));
      const bidTime = BigInt(Math.floor(new Date(biddingDeadline).getTime() / 1000));

      const currentChainId = await walletClient.getChainId();
      if (currentChainId !== 10143) {
        try {
          await walletClient.switchChain({ id: 10143 });
        } catch (e) {
          console.error("Failed to switch chain:", e);
          throw new Error("Please switch your wallet to the Monad Testnet.");
        }
      }

      const hash = await walletClient.writeContract({
        address: BOUNTY_BOARD_ADDRESS as `0x${string}`,
        abi: BountyBoardAbi,
        functionName: 'createTask',
        args: [
          bidTime,
          execTime,
          parseInt(selectionMode),
          criteriaHash,
          goldHashBytes32,
          inputHashBytes32
        ],
        value: parsedReward,
        gas: 300000n,
        account,
      });

      console.log('Transaction hash:', hash);
      await publicClient.waitForTransactionReceipt({ hash });

      // Step 4: Notify frontend handler
      await onSubmit({
        title,
        description,
        reward: parseFloat(reward),
        deadline: executionDeadline,
      });
      
      // Reset form
      setStep(1);
      setTitle('');
      setReward('');
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-1 border border-white/60 rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-taupe-400/30 flex items-center justify-between">
          <h2 className="text-xl font-light tracking-[-0.02em] text-ink-900">Create Task Wizard - Step {step} of 4</h2>
          <button onClick={onClose} className="text-ink-600 hover:text-ink-900 p-2 rounded-[9999px] hover:bg-taupe-400/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Template</label>
                <select value={template} onChange={e => setTemplate(e.target.value)}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors">
                  <option value="text-extraction">Data Extraction</option>
                  <option value="code-generation">Code Generation</option>
                  <option value="translation">Translation</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Inputs (Paste raw data or links)</label>
                <textarea value={inputsText} onChange={e => setInputsText(e.target.value)} rows={3}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2 flex justify-between items-center">
                  <span>Criteria Builder</span>
                  <button type="button" onClick={addCriterion} className="text-orange-500 text-xs font-medium hover:underline flex items-center">
                    <Plus size={14} className="mr-1" /> Add Criterion
                  </button>
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {criteria.map((c, idx) => (
                    <div key={idx} className="flex space-x-3">
                      <input type="text" value={c.description} onChange={e => updateCriterion(idx, 'description', e.target.value)} placeholder="Criterion description"
                        className="flex-1 bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500" />
                      <input type="number" value={c.points} onChange={e => updateCriterion(idx, 'points', parseInt(e.target.value))} placeholder="Pts"
                        className="w-20 bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Gold Set (For Verifiers Only)</label>
                <div className="glass-2 border border-taupe-400/50 rounded-[24px] p-4 flex flex-col items-center justify-center space-y-3 border-dashed">
                  <Upload size={32} className="text-ink-600" />
                  <p className="text-sm text-ink-600">Upload your expected answers/golden dataset</p>
                  <p className="text-xs text-taupe-400">This is stored in the backend vault. Only the hash is committed on-chain.</p>
                </div>
                <textarea value={goldSetText} onChange={e => setGoldSetText(e.target.value)} rows={3} placeholder="Paste gold set JSON here..."
                  className="w-full mt-4 bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 text-sm font-mono" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Reward (MONAD)</label>
                  <input type="number" min="0" step="0.01" value={reward} onChange={e => setReward(e.target.value)} required
                    className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Selection Mode</label>
                  <select value={selectionMode} onChange={e => setSelectionMode(e.target.value)}
                    className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors">
                    <option value="0">Manual</option>
                    <option value="1">Reputation Based</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Bidding Deadline</label>
                  <input type="datetime-local" value={biddingDeadline} onChange={e => setBiddingDeadline(e.target.value)} required
                    className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Execution Deadline</label>
                  <input type="datetime-local" value={executionDeadline} onChange={e => setExecutionDeadline(e.target.value)} required
                    className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-taupe-400/30">
            <button type="button" onClick={handlePrev} disabled={step === 1}
              className="px-5 py-2.5 rounded-[9999px] font-medium text-ink-600 hover:text-ink-900 hover:bg-taupe-400/20 disabled:opacity-0 flex items-center transition-colors">
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>
            
            {step < 4 ? (
              <button type="button" onClick={handleNext}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium flex items-center hover:bg-orange-500/90 transition-all shadow-sm">
                Next <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium flex items-center hover:bg-orange-500/90 disabled:opacity-50 transition-all shadow-sm">
                {isSubmitting ? 'Submitting...' : 'Fund & Create'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
