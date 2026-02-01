import React, { useState, useEffect } from 'react';
import { 
  Database, Server, Activity, AlertTriangle, CheckCircle2, 
  ChevronRight, Users, Zap, Brain, LayoutDashboard, 
  RotateCcw, ShieldCheck, Layers, Gauge, Maximize2
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  LineElement, PointElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, 
  PointElement, Title, Tooltip, Legend, Filler
);

const App = () => {
  const [activeTab, setActiveTab] = useState('use-cases');
  const [selectedCase, setSelectedCase] = useState(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcards = [
    { q: "What is 'Zero Copy' and why is it important?", a: "Kafka uses sendfile() to copy data directly from the disk buffer to the network buffer, bypassing the application heap. This avoids CPU-intensive context switching and memory copies, enabling near-network-speed throughput." },
    { q: "Explain the difference between 'acks=all' and 'min.insync.replicas'.", a: "acks=all ensures the leader waits for all in-sync replicas to acknowledge. min.insync.replicas (on broker) defines the minimum number of ISRs required to accept a write. If ISR count < min.insync.replicas, the producer receives NotEnoughReplicasException." },
    { q: "How does Kafka handle Consumer Rebalancing?", a: "The Group Coordinator (a broker) and the Group Leader (a consumer) work together. When a member leaves/joins, the coordinator triggers a rebalance. The leader uses a PartitionAssignor (Range, RoundRobin, Sticky) to re-allocate partitions to members." },
    { q: "What is the role of the Controller in a Kafka Cluster?", a: "The Controller is a broker responsible for managing partition leadership. It handles replica state changes, elects new leaders when brokers fail, and communicates metadata changes to all other brokers in the cluster." },
    { q: "How do you achieve 'Exactly-Once' Semantics (EOS)?", a: "By using an Idempotent Producer (pid + sequence number to de-duplicate) and the Transactional API. It ensures that writes to multiple partitions and offset commits are treated as a single atomic unit." }
  ];

  const designQuestions = [
    {
      title: "Designing for High Availability & Durability",
      scenario: "A financial app needs to ensure zero data loss across three availability zones.",
      answer: {
        pattern: "Multi-AZ Replication",
        strategy: "Set `replication.factor=3`, `min.insync.replicas=2`, and `acks=all`. Ensure `unclean.leader.election.enable=false` to prevent data-loss transitions.",
        why: "This configuration guarantees that at least two replicas must acknowledge a write before it's successful, protecting against a total AZ failure."
      }
    },
    {
      title: "Scaling Consumption for massive traffic spikes",
      scenario: "A retail site's message lag spikes during Black Friday. Current 10 partitions are saturated.",
      answer: {
        pattern: "Horizontal Partition Scaling",
        strategy: "Increase partition count to 50. Ensure key-based ordering isn't broken (increasing partitions changes key-to-partition mapping). Update Consumer Group size to 50.",
        why: "Kafka's parallelism is capped by the number of partitions. One partition = Max one consumer per group."
      }
    },
    {
      title: "Optimizing for Low Latency vs. Throughput",
      scenario: "Design a configuration for a real-time gaming leaderboard vs. a daily billing batch.",
      answer: {
        pattern: "Producer Tuning",
        strategy: "Gaming (Latency): `linger.ms=0`, `batch.size` small, `compression.type=none`. Billing (Throughput): `linger.ms=50-100`, `batch.size=64KB+`, `compression.type=lz4`.",
        why: "Throughput benefits from large batches (fewer network requests); Latency benefits from immediate sends."
      }
    }
  ];

  const nextCard = () => { setIsFlipped(false); setTimeout(() => setFlashcardIdx((flashcardIdx + 1) % flashcards.length), 150); };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-12">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center text-white font-bold">K</div>
          <h1 className="text-xl font-bold tracking-tight">Kafka Interview Master Suite</h1>
        </div>
        <nav className="flex bg-stone-100 p-1 rounded-lg">
          {['use-cases', 'design', 'flashcards'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition ${activeTab === tab ? 'bg-white shadow-sm text-amber-600' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'use-cases' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full bg-white p-8 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Real-World Scale</h2>
                    <p className="text-stone-500">How industry leaders leverage Kafka for billion-scale events.</p>
                  </div>
                  <Globe className="text-stone-200" size={48} />
                </div>
                {/* LinkedIn, Netflix, Uber cards from previous version (Condensed) */}
                {['LinkedIn', 'Netflix', 'Uber', 'Airbnb'].map(co => (
                  <div key={co} className="bg-white p-6 rounded-xl border border-stone-200 hover:border-amber-500 transition cursor-help">
                    <h3 className="font-bold text-lg mb-2">{co}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {co === 'LinkedIn' ? "Solves 'N-squared' connectivity for 7 trillion messages/day via unified event logs." :
                       co === 'Netflix' ? "Real-time movie recommendations using sub-second event-to-insight pipelines." :
                       co === 'Uber' ? "Calculating dynamic surge pricing by processing trillions of GPS pings daily." :
                       "Syncing search indices (Elasticsearch) with DB changes via Change Data Capture."}
                    </p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-bold mb-3">System Design Scenarios</h2>
              <p className="text-stone-500 italic text-sm">Targeting Mid-Senior Level Interview Questions</p>
            </div>
            
            <div className="space-y-6">
              {designQuestions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <div className="bg-stone-900 p-4 flex items-center gap-3">
                    <ShieldCheck className="text-amber-500" size={20} />
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">{q.title}</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Scenario</span>
                      <p className="text-stone-800 font-medium">{q.scenario}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-2">Architectural Fix</span>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Layers size={16} className="text-stone-400 mt-1" />
                          <div>
                            <p className="text-xs font-bold">{q.answer.pattern}</p>
                            <p className="text-xs text-stone-600 leading-relaxed">{q.answer.strategy}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2 border-t border-stone-200">
                          <Zap size={16} className="text-amber-400 mt-1" />
                          <p className="text-[11px] text-stone-500 italic">"Why: {q.answer.why}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="flex flex-col items-center justify-center h-[500px] animate-in zoom-in-95">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
                <Brain className="text-amber-600" /> Active Recall Training
              </h2>
              <p className="text-stone-500 text-sm mt-1">Click the card to flip</p>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-md h-64 relative cursor-pointer perspective-1000"
            >
              <div className={`relative w-full h-full text-center transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute w-full h-full bg-white border-2 border-stone-200 rounded-3xl shadow-lg flex items-center justify-center p-8 backface-hidden">
                  <p className="text-xl font-bold text-stone-800 leading-snug">{flashcards[flashcardIdx].q}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full bg-amber-600 text-white border-2 border-amber-700 rounded-3xl shadow-lg flex items-center justify-center p-8 backface-hidden rotate-y-180 overflow-y-auto">
                  <p className="text-sm font-medium leading-relaxed">{flashcards[flashcardIdx].a}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <span className="text-xs font-bold text-stone-400 tracking-widest">{flashcardIdx + 1} / {flashcards.length}</span>
              <button 
                onClick={nextCard}
                className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-amber-600 transition"
              >
                Next Concept <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default App;
