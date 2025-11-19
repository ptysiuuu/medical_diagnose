import pandas as pd
from sentence_transformers import SentenceTransformer, util
import os
import torch

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
PRECAUTION_FILE = os.path.join(DATA_DIR, "Disease precaution.csv")

class PrecautionEngine:
    def __init__(self):
        print("Loading precaution data...")
        self.df = pd.read_csv(PRECAUTION_FILE)
        # Normalize disease names: strip whitespace
        self.df['Disease'] = self.df['Disease'].str.strip()

        print("Loading sentence transformer...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def get_precautions(self, disease_name: str, user_input: str):
        # Find row for disease
        disease_name = disease_name.strip()
        row = self.df[self.df['Disease'] == disease_name]

        if row.empty:
            return []

        # Extract precautions
        precautions = []
        for i in range(1, 5):
            col = f'Precaution_{i}'
            if col in row.columns and pd.notna(row.iloc[0][col]):
                precautions.append(row.iloc[0][col])

        if not precautions:
            return []

        # Rank precautions based on user input
        # Encode user input and precautions
        embeddings = self.model.encode([user_input] + precautions, convert_to_tensor=True)

        user_embedding = embeddings[0]
        precaution_embeddings = embeddings[1:]

        # Compute cosine similarity
        cosine_scores = util.cos_sim(user_embedding, precaution_embeddings)[0]

        # Create list of (precaution, score)
        ranked_precautions = []
        for i, score in enumerate(cosine_scores):
            ranked_precautions.append({
                "precaution": precautions[i],
                "relevance_score": float(score)
            })

        # Sort by score descending
        ranked_precautions.sort(key=lambda x: x['relevance_score'], reverse=True)

        return ranked_precautions

# Global instance
precaution_engine = PrecautionEngine()
