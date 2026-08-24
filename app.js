const socket = io();

const addForm = document.getElementById("addForm");
const pairingBox = document.getElementById("pairingBox");
const pairingCodeDisplay = document.getElementById("pairingCodeDisplay");
const sessionRows = document.getElementById("sessionRows");

function statusLabel(s) {
  const map = {
    connected: "Connected",
    connecting: "Connecting...",
    awaiting_pairing: "Waiting for pairing",
    reconnecting: "Reconnecting...",
    error: "Error",
    logged_out: "Logged out",
  };
  return map[s] || s;
}

socket.on("sessions", (sessions) => {
  sessionRows.innerHTML = "";
  sessions.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.label}</td>
      <td>${s.phone}</td>
      <td><span class="status ${s.status}">${statusLabel(s.status)}</span></td>
      <td>${s.pairingCode || "-"}</td>
      <td><button class="link-btn" data-id="${s.id}">Logout</button></td>
    `;
    sessionRows.appendChild(tr);
  });

  document.querySelectorAll(".link-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await fetch(`/api/sessions/${id}/logout`, { method: "POST" });
    });
  });

  const pending = sessions.find((s) => s.status === "awaiting_pairing" && s.pairingCode);
  if (pending) {
    pairingBox.classList.remove("hidden");
    pairingCodeDisplay.textContent = pending.pairingCode;
  }
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const label = document.getElementById("label").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const id = `${label.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}`;

  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, phone, label }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.error || "Failed to start session");
    return;
  }

  addForm.reset();
});