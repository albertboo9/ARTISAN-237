"use client";

import { useState } from "react";
import { Brain, Cpu, FileText, CheckCircle2, ArrowDown } from "lucide-react";

export default function AiDemoPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const simulateRun = () => {
    setLoading(true);
    setStep(1);
    
    setTimeout(() => setStep(2), 1000);
    setTimeout(() => setStep(3), 2500);
    setTimeout(() => {
      setStep(4);
      setLoading(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-emerald-500 w-8 h-8" />
            AI Engine Debugger
          </h1>
          <p className="text-neutral-400 mt-2">Vue interne de démonstration de la pipeline d'inférence (Soutenance Académique)</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Entrée Utilisateur */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-400" />
              1. Entrée Utilisateur
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-500">Besoin Client (Smart Job Builder)</label>
                <textarea 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm mt-1 focus:border-emerald-500 outline-none transition-colors"
                  rows={3}
                  defaultValue="Je cherche un bon plombier en urgence du côté de Ndokoti pour une fuite d'eau."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">Artisan Cible</label>
                  <input type="text" readOnly value="ART_0942 (Plombier)" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm mt-1 text-neutral-300" />
                </div>
                <div>
                  <label className="text-sm text-neutral-500">Repère Artisan</label>
                  <input type="text" readOnly value="Tradex Bassa" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm mt-1 text-neutral-300" />
                </div>
              </div>
              <button 
                onClick={simulateRun}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 mt-4"
              >
                {loading ? "Inférence en cours..." : "Lancer le moteur IA"}
              </button>
            </div>
          </div>

          {/* Pipeline */}
          <div className="space-y-4">
            
            {/* Features */}
            <div className={`p-5 rounded-2xl border transition-all duration-500 ${step >= 1 ? "bg-neutral-900 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-neutral-950 border-neutral-800 opacity-50"}`}>
              <h3 className="font-medium flex items-center justify-between">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> 2. Feature Engineering</span>
                {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </h3>
              {step >= 1 && (
                <div className="mt-3 text-xs font-mono text-emerald-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  {`{
  "metier_num": 14,
  "repere_client_num": 8,
  "repere_artisan_num": 12,
  "distance_km": 2.4,
  "note_moyenne": 4.8,
  "temps_reponse_moyen_min": 15
}`}
                </div>
              )}
            </div>
            
            <div className="flex justify-center"><ArrowDown className={`w-5 h-5 ${step >= 2 ? "text-emerald-500" : "text-neutral-800"}`} /></div>

            {/* Random Forest */}
            <div className={`p-5 rounded-2xl border transition-all duration-500 ${step >= 2 ? "bg-neutral-900 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-neutral-950 border-neutral-800 opacity-50"}`}>
              <h3 className="font-medium flex items-center justify-between">
                <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> 3. Random Forest Model</span>
                {step >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </h3>
              {step >= 2 && (
                <p className="text-sm text-neutral-400 mt-2">Chargement de \`mod_artisan_rf.pkl\` (100 estimators, max_depth=15). Calcul prédictif en cours...</p>
              )}
            </div>

            <div className="flex justify-center"><ArrowDown className={`w-5 h-5 ${step >= 3 ? "text-emerald-500" : "text-neutral-800"}`} /></div>

            {/* Résultat */}
            <div className={`p-5 rounded-2xl border transition-all duration-500 ${step >= 3 ? "bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-neutral-950 border-neutral-800 opacity-50"}`}>
              <h3 className="font-medium flex items-center justify-between text-emerald-400">
                <span>4. Résultat & Explainability</span>
                {step >= 4 && <span className="font-bold text-2xl">92%</span>}
              </h3>
              {step >= 4 && (
                <div className="mt-3 text-sm text-emerald-100/90 bg-emerald-900/40 p-4 rounded-lg border border-emerald-800/50 leading-relaxed">
                  <p className="mb-2 font-medium text-emerald-400 uppercase text-xs tracking-wider">Génération XAI (Explicabilité)</p>
                  "Cet artisan est hautement recommandé car il intervient dans votre secteur géographique immédiat (2.4 km), possède d'excellentes évaluations (4.8/5) et répond habituellement très rapidement (moins de 15 minutes)."
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
