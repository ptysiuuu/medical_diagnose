# Medical Diagnose

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://medical-diagnose.vercel.app/)

**Medical Diagnose** is a semantic search engine tailored for clinical symptom analysis. Instead of relying on rigid keyword matching, it uses **vector embeddings** to understand the *meaning* behind a patient's description, matching natural language queries to a database of medical conditions.

### ⚠️ Important Disclaimer
*This project is an engineering prototype for educational purposes. The outputs are algorithmic suggestions and **NOT** medical advice. Always consult a qualified medical professional.*

---

## 🛠 Engineering & Architecture

This system demonstrates a modern RAG (Retrieval-Augmented Generation) architecture, decoupling the inference engine from the user interface.

### 1. Machine Learning & Retrieval Engine
* **Vector Knowledge Base:** Implements a `DiseaseKnowledgeBase` class that maps medical conditions to a 384-dimensional vector space.
* **Semantic Embedding:** Utilizes the `sentence-transformers/all-MiniLM-L12-v2` model to encode both disease descriptions and user queries into dense vectors.
* **Similarity Search:** Leverages **FAISS (Facebook AI Similarity Search)** with an `IndexFlatIP` (Inner Product) index for highly efficient, millisecond-level similarity lookups.

### 2. Backend API (FastAPI)
* **Inference Server:** A lightweight FastAPI service acting as the bridge between the frontend and the vector index.
* **Schema Validation:** Uses Pydantic models (`SymptomInput`, `DiagnosisResponse`) to enforce strict typing on input data and response structures.
* **Contextual Advice:** The `DiseaseAdvisor` wrapper enriches raw similarity search results by attaching relevant precautions dynamically fetched from a secondary dataset.

### 3. Frontend (React + Vite)
* **Modern UI/UX:** Built with React, featuring a "glassmorphism" design (`glass-panel`) and custom visual components like `DarkVeil` to create an immersive user experience.
* **Real-time Integration:** Asynchronously queries the `/diagnose` endpoint, managing loading states and error handling to provide instant feedback to the user.

---

## 📈 Data Pipeline

The project features a custom ETL (Extract, Transform, Load) pipeline developed in Python/Pandas:

1.  **Ingestion:** Raw CSV data containing scattered symptom columns (`Symptom_1` to `Symptom_17`) is ingested.
2.  **Canonicalization:** A processing layer aggregates these disjointed features into coherent natural language sentences (e.g., *"Fungal infection is characterized by the following symptoms: itching, skin_rash..."*). This step is crucial for maximizing the semantic understanding of the embedding model.
3.  **Indexing:** These canonical descriptions are embedded and persisted into a FAISS index (`faiss.index`) and metadata store, ensuring the backend can reload the state without retraining.

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **AI / ML** | PyTorch, SentenceTransformers, FAISS, NumPy, Pandas |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | React, Vite, CSS3 (Custom Animations) |
| **Deployment** | Docker (Containerization), Vercel |

---

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/improved-embeddings`).
3.  Commit your changes.
4.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
