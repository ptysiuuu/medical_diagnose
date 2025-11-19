import React, { useEffect, useMemo, useState } from 'react';

const confidenceTone = (score) => {
    if (score > 0.75) return 'high';
    if (score > 0.5) return 'medium';
    return 'low';
};

const normalizeSymptom = (text = '') => {
    const cleaned = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    return cleaned
        .toLowerCase()
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const extractSymptomData = (text = '') => {
    if (!text) return { summary: '', symptoms: [] };

    const match = text.match(/symptoms:\s*(.+)$/i);
    if (!match) {
        return { summary: text, symptoms: [] };
    }

    const summary = text.slice(0, match.index).trim().replace(/[,:]$/, '');
    const listPortion = match[1].replace(/\.$/, '');
    const symptoms = listPortion
        .split(/[,;]+/)
        .map((item) => normalizeSymptom(item))
        .filter(Boolean);

    return {
        summary: summary || text,
        symptoms
    };
};

const DiagnosisCard = ({ prediction, index }) => {
    const { disease, confidence, description, precautions = [] } = prediction;
    const [meter, setMeter] = useState(0);
    const percentage = Math.round(confidence * 100);

    const { summary, symptoms } = useMemo(() => extractSymptomData(description), [description]);

    useEffect(() => {
        const timer = setTimeout(() => setMeter(percentage), 150 + index * 80);
        return () => clearTimeout(timer);
    }, [percentage, index]);

    return (
        <article className="diagnosis-card" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="diagnosis-card__header">
                <div>
                    <p className="eyebrow">Likely condition</p>
                    <h3>{disease}</h3>
                </div>
                <span className={`confidence-chip ${confidenceTone(confidence)}`}>
                    {meter}% match
                </span>
            </div>

            <p className="diagnosis-card__description">{summary}</p>

            {symptoms.length > 0 && (
                <div className="symptom-block">
                    <p className="eyebrow">Symptom pattern</p>
                    <ul className="symptom-tags">
                        {symptoms.map((item, idx) => (
                            <li key={`${disease}-symptom-${idx}`} className="symptom-tag">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div
                className="confidence-meter"
                role="progressbar"
                aria-valuenow={meter}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <span className="confidence-meter__fill" style={{ width: `${meter}%` }} />
            </div>

            <div className="precaution-block">
                <p className="eyebrow">Suggested precautions</p>
                {precautions.length ? (
                    <ul>
                        {precautions.map((item, idx) => (
                            <li key={`${item}-${idx}`}>
                                <span className="pill-index">{idx + 1}</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="muted">No specific precautions recorded.</p>
                )}
            </div>
        </article>
    );
};

export default DiagnosisCard;