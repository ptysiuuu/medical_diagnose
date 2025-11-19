from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).resolve().parent / "data"
SYMPTOMS_FILE = DATA_DIR / "DiseaseAndSymptoms.csv"
PRECAUTIONS_FILE = DATA_DIR / "Disease precaution.csv"
EDUCATIONAL_DISCLAIMER = (
    "This diagnostic assistant is for educational purposes only and cannot replace consultation "
    "with a licensed healthcare professional."
)


@dataclass
class RetrievedDisease:
    disease: str
    description: str
    similarity: float


class DiseaseKnowledgeBase:
    """Builds and queries a FAISS vector index over canonical disease descriptions."""

    def __init__(self, embedding_model: str = "sentence-transformers/all-MiniLM-L12-v2"):
        self.embedding_model_name = embedding_model
        self.embedder = SentenceTransformer(self.embedding_model_name)
        self.index: faiss.Index | None = None
        self.embeddings: np.ndarray | None = None
        self.diseases: List[str] = []
        self.descriptions: List[str] = []

    def build_from_dataframe(self, df: pd.DataFrame) -> "DiseaseKnowledgeBase":
        canonical_descriptions = []
        grouped = df.groupby("Disease")

        for disease, group in grouped:
            symptoms_set = set()
            for i in range(1, 18):
                col = f"Symptom_{i}"
                if col in group.columns:
                    symptoms = group[col].dropna().astype(str).str.strip().tolist()
                    symptoms_set.update(symptoms)

            symptoms_str = ", ".join(sorted(symptoms_set))
            canonical_descriptions.append(
                {
                    "Disease": disease,
                    "Canonical Description": f"{disease} is characterized by the following symptoms: {symptoms_str}.",
                }
            )

        canonical_df = pd.DataFrame(canonical_descriptions)
        self.descriptions = canonical_df["Canonical Description"].tolist()
        self.diseases = canonical_df["Disease"].tolist()

        self.embeddings = self.embedder.encode(
            self.descriptions, convert_to_numpy=True, normalize_embeddings=True
        )
        dim = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(self.embeddings)
        print(f"Indexed {self.index.ntotal} diseases (dim={dim}).")
        return self

    def build_from_csv(self, csv_path: Path) -> "DiseaseKnowledgeBase":
        print(f"Building knowledge base from {csv_path}...")
        df = pd.read_csv(csv_path)
        return self.build_from_dataframe(df)

    def search(self, query: str, top_k: int = 3) -> List[RetrievedDisease]:
        if self.index is None:
            raise ValueError("Index not built. Call build_from_csv() before search().")

        query_embedding = self.embedder.encode(
            [query], convert_to_numpy=True, normalize_embeddings=True
        )
        distances, indices = self.index.search(query_embedding, top_k)

        results: List[RetrievedDisease] = []
        for score, idx in zip(distances[0], indices[0]):
            if 0 <= idx < len(self.diseases):
                results.append(
                    RetrievedDisease(
                        disease=self.diseases[idx],
                        description=self.descriptions[idx],
                        similarity=float(score),
                    )
                )
        return results


class DiseaseAdvisor:
    """Combines the knowledge base with precaution lookups."""

    def __init__(
        self,
        knowledge_base: DiseaseKnowledgeBase,
        precaution_df: pd.DataFrame,
        default_top_k: int = 2,
    ):
        self.kb = knowledge_base
        self.default_top_k = default_top_k
        self.precaution_lookup = self._build_precaution_lookup(precaution_df)

    @staticmethod
    def _build_precaution_lookup(df: pd.DataFrame) -> Dict[str, List[str]]:
        precaution_cols = [col for col in df.columns if col.lower().startswith("precaution")]
        lookup: Dict[str, List[str]] = {}
        for _, row in df.iterrows():
            disease = str(row["Disease"]).strip()
            steps = [
                str(row[col]).strip()
                for col in precaution_cols
                if col in row and pd.notna(row[col]) and str(row[col]).strip()
            ]
            if steps:
                lookup[disease] = steps
        return lookup

    def advise(self, query: str, top_k: int | None = None) -> List[Dict[str, object]]:
        k = top_k or self.default_top_k
        hits = self.kb.search(query, top_k=k)
        payload = []
        for hit in hits:
            payload.append(
                {
                    "disease": hit.disease,
                    "similarity": hit.similarity,
                    "description": hit.description,
                    "precautions": self.precaution_lookup.get(hit.disease, []),
                }
            )
        return payload


def bootstrap_advisor() -> DiseaseAdvisor:
    kb = DiseaseKnowledgeBase()
    if not SYMPTOMS_FILE.exists():
        raise FileNotFoundError(f"Symptoms dataset not found at {SYMPTOMS_FILE}")
    kb.build_from_csv(SYMPTOMS_FILE)

    if not PRECAUTIONS_FILE.exists():
        raise FileNotFoundError(f"Precaution dataset not found at {PRECAUTIONS_FILE}")
    precaution_df = pd.read_csv(PRECAUTIONS_FILE)
    return DiseaseAdvisor(kb, precaution_df)


advisor = bootstrap_advisor()
