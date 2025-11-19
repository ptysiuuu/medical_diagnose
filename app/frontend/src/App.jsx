import React, { useMemo, useState } from 'react';
import { diagnoseSymptoms } from './api';
import DiagnosisCard from './components/DiagnosisCard';
import DarkVeil from './components/DarkVeil';
import './App.css';

const DEFAULT_DISCLAIMER =
  'This assistant is for educational purposes only and cannot replace consultation with a licensed healthcare professional.';

function App() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(3);
  const [predictions, setPredictions] = useState([]);
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const disabled = !query.trim() || status === 'loading';
  const showResults = predictions.length > 0 && status === 'done';

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Analyzing symptom narrative…';
      case 'done':
        return `Showing ${predictions.length} ranked hypothesis${predictions.length === 1 ? '' : 'es'}`;
      case 'error':
        return 'We ran into a problem';
      default:
        return 'Describe what you are feeling to begin the analysis.';
    }
  }, [status, predictions.length]);

  const handleTopKChange = (event) => {
    const numeric = Number(event.target.value);
    if (Number.isNaN(numeric)) {
      setTopK(3);
      return;
    }
    setTopK(Math.min(5, Math.max(1, numeric)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    setStatus('loading');
    setError('');
    setPredictions([]);

    try {
      const data = await diagnoseSymptoms(query, { topK });
      setPredictions(data.predictions ?? []);
      setDisclaimer(data.disclaimer ?? DEFAULT_DISCLAIMER);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Unable to analyze symptoms right now.');
      setStatus('error');
    }
  };

  return (
    <div className="app-shell">
      <div className="background-effects" aria-hidden="true">
        <div className="floating-lines-wrapper">
          <DarkVeil
            hueShift={18}
            noiseIntensity={0.035}
            scanlineIntensity={0.18}
            scanlineFrequency={520.0}
            warpAmount={0.04}
            speed={0.65}
            resolutionScale={1.1}
          />
        </div>
        <span className="aurora aurora-one" />
        <span className="aurora aurora-two" />
      </div>

      <div className="content-wrapper">
        <header className="hero" id="about">
          <span className="pulse-badge">AI powered · Vector Reasoning</span>
          <h1 className="headline">AI Symptom Analysis Studio</h1>
          <p className="subhead">
            Describe your sensations in natural language and receive AI-assisted hypotheses plus curated precautions.
            Everything stays private until you press analyze, and every result is paired with an educational disclaimer.
          </p>
        </header>

        <section className="diagnosis-grid">
          <article className="glass-panel glass-form" aria-label="Symptom input form">
            <form onSubmit={handleSubmit} className="form-layout">
              <label className="input-label" htmlFor="symptom-text">
                Symptom narrative
              </label>
              <textarea
                id="symptom-text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Example: Persistent dry cough, tight chest at night, dizziness when standing up, mild fever."
                rows={6}
                spellCheck={false}
              />

              <div className="control-bar">
                <label className="input-label" htmlFor="topk">
                  Suggestions
                  <input
                    id="topk"
                    type="number"
                    min={1}
                    max={5}
                    value={topK}
                    onChange={handleTopKChange}
                  />
                </label>
                <button type="submit" className="primary-button" disabled={disabled}>
                  {status === 'loading' ? (
                    <span className="button-loader">
                      <span className="spinner" />
                      Analyzing
                    </span>
                  ) : (
                    <>
                      <span>Analyze symptoms</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              <p className="input-hint">
                We use embeddings + FAISS to surface the closest canonical disease descriptions, then attach curated precautions.
              </p>
            </form>

            {error && (
              <div className="inline-error" role="alert">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </article>

          <article className="glass-panel results-panel">
            <div className="results-body">
              <div className="results-status" aria-live="polite">
                {statusLabel}
              </div>

              {status === 'idle' && (
                <p className="muted">
                  Start with a detailed description – duration, intensity, triggers, anything that stands out.
                </p>
              )}

              {status === 'loading' && (
                <div className="skeleton-list">
                  <div className="skeleton-card" />
                  <div className="skeleton-card" />
                </div>
              )}

              {status === 'error' && (
                <p className="error-text">{error || 'Something went wrong. Please try again.'}</p>
              )}

              {showResults && (
                <div className="results-list">
                  {predictions.map((prediction, index) => (
                    <DiagnosisCard key={`${prediction.disease}-${index}`} prediction={prediction} index={index} />
                  ))}
                </div>
              )}
            </div>

            <div className="disclaimer-card" id="disclaimer">
              <h4>Educational use only</h4>
              <p>{disclaimer}</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default App;