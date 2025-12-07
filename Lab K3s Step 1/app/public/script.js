let API_URL = "";

// Charger la configuration d'abord
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/config");
    const cfg = await res.json();
    API_URL = cfg.apiUrl;
    console.log("✅ API_URL chargé :", API_URL);

    // Une fois la config chargée, on charge les données
    await loadData();

    // On attache le listener du formulaire ici aussi
    document.getElementById("dataForm").addEventListener("submit", handleFormSubmit);
  } catch (err) {
    console.error("❌ Erreur lors du chargement de la configuration :", err);
  }
});

async function loadData() {
  const listEl = document.getElementById("dataList");
  listEl.innerHTML = "<li>Chargement...</li>";

  try {
    const res = await fetch(`${API_URL}/list`);
    const data = await res.json();

    listEl.innerHTML = "";
    if (data.length === 0) {
      listEl.innerHTML = "<li>Aucune donnée enregistrée</li>";
    } else {
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} (${item.email})`;
        listEl.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Erreur loadData:", err);
    listEl.innerHTML = "<li>Erreur lors du chargement des données</li>";
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  try {
    await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    document.getElementById("dataForm").reset();
    await loadData();
  } catch (err) {
    alert("Erreur lors de l'envoi des données");
    console.error(err);
  }
}
