const API_URL = "http://192.168.100.10:30101/api";


// Exécuté lorsque le DOM est prêt
window.addEventListener("DOMContentLoaded", async () => {
  try {
   
    console.log("✅ API_URL chargé :", API_URL);

    // Charger les données initiales
    await loadData();

    // Attacher l'événement du formulaire après le chargement de la config
    const form = document.getElementById("dataForm");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    } else {
      console.error("❌ Formulaire introuvable dans le DOM !");
    }
  } catch (err) {
    console.error("❌ Erreur lors du chargement de la configuration :", err);
    alert("Erreur : impossible de charger la configuration du serveur.");
  }
});

// Charger les données depuis le backend
async function loadData() {
  const listEl = document.getElementById("dataList");
  if (!listEl) {
    console.error("❌ Élément #dataList introuvable dans le DOM !");
    return;
  }

  listEl.innerHTML = "<li>Chargement...</li>";

  try {
    const res = await fetch(`${API_URL}/list`);
    if (!res.ok) throw new Error(`Erreur API (${res.status})`);
    const data = await res.json();

    listEl.innerHTML = "";
    if (!data || data.length === 0) {
      listEl.innerHTML = "<li>Aucune donnée enregistrée</li>";
    } else {
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} (${item.email})`;
        listEl.appendChild(li);
      });
    }
  } catch (err) {
    console.error("❌ Erreur loadData:", err);
    listEl.innerHTML = "<li>Erreur lors du chargement des données</li>";
  }
}

// Gérer la soumission du formulaire
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (!name || !email) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    if (!res.ok) throw new Error(`Erreur d'envoi (${res.status})`);

    document.getElementById("dataForm").reset();
    await loadData();

    alert("✅ Données enregistrées avec succès !");
  } catch (err) {
    console.error("❌ Erreur handleFormSubmit:", err);
    alert("Erreur lors de l'envoi des données au serveur.");
  }
}
