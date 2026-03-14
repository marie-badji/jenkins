import { useState, useEffect } from "react";

const API = "http://localhost:8080/api/taches";

function App() {
  const [taches, setTaches] = useState([]);
  const [titre, setTitre] = useState("");

  useEffect(() => {
    fetch(API)
        .then(res => res.json())
        .then(data => setTaches(data));
  }, []);

  const ajouterTache = () => {
    if (!titre.trim()) return;
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, terminee: false })
    })
        .then(res => res.json())
        .then(data => {
          setTaches([...taches, data]);
          setTitre("");
        });
  };

  const toggleTache = (tache) => {
    fetch(`${API}/${tache.id}`, {
      method: "PUT",
      headers: { "Content-Type": "Application/json" },
      body: JSON.stringify({ ...tache, terminee: !tache.terminee })
    })
        .then(res => res.json())
        .then(updated => setTaches(taches.map(t => t.id === updated.id ? updated : t)));
  };

  const supprimerTache = (id) => {
    fetch(`${API}/${id}`, { method: "DELETE" })
        .then(() => setTaches(taches.filter(t => t.id !== id)));
  };

  return (
      <div style={{ maxWidth: "601px", margin: "40px auto", fontFamily: "Arial" }}>
        <h1>📝 Todo App</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Nouvelle tâche..."
              style={{ flex: 1, padding: "8px", fontSize: "16px" }}
          />
          <button onClick={ajouterTache} style={{ padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
            Ajouter
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {taches.map(t => (
              <li key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderBottom: "1px solid #ddd" }}>
                <input type="checkbox" checked={t.terminee} onChange={() => toggleTache(t)} />
                <span style={{ flex: 1, textDecoration: t.terminee ? "line-through" : "none" }}>{t.titre}</span>
                <button onClick={() => supprimerTache(t.id)} style={{ background: "#f44336", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}>
                  ✕
                </button>
              </li>
          ))}
        </ul>
      </div>
  );
}

export default App;