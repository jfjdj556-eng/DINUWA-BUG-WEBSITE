const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== WHATSAPP PAIRING API =====
app.post('/api/pair', async (req, res) => {
  const { phone } = req.body;
  const clean = phone.toString().replace(/[^0-9]/g, '');
  if (!clean || clean.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
      auth: state,
      browser: ['Chrome', 'Windows', ''],
      printQRInTerminal: false
    });
    sock.ev.on('creds.update', saveCreds);
    const code = await sock.requestPairingCode(clean);
    res.json({ success: true, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== SESSION STATUS =====
app.get('/api/status', (req, res) => {
  const exists = fs.existsSync('auth_info/creds.json');
  res.json({ paired: exists });
});

// ===== DESTROY API =====
const PROXY_LIST = [
  "104.16.137.28:80","159.112.235.185:80","188.42.89.3:80","154.197.75.123:80",
  "104.18.102.219:80","185.193.31.27:80","104.20.45.108:80","104.21.20.188:80",
  "173.245.49.25:80","45.80.111.192:80","104.21.206.251:80","45.80.108.242:80",
  "104.16.246.227:80","104.21.237.64:80","181.214.1.145:80","89.116.250.119:80",
  "172.67.182.138:80","104.27.8.166:80","156.225.72.211:80","104.25.66.54:80",
  "172.67.179.213:80","190.93.245.9:80","91.193.59.35:80","104.25.210.239:80",
  "185.148.105.62:80","104.17.128.227:80","104.21.27.106:80","170.114.46.57:80",
  "104.16.128.212:80","172.67.142.0:80","168.234.75.119:80","185.146.173.158:80",
  "199.34.228.37:80","104.18.38.2:80","45.131.208.48:80","172.67.234.227:80",
  "103.21.244.187:80","103.160.204.144:80","212.183.88.164:80","5.10.244.244:80",
  "198.177.56.45:80","69.84.182.252:80","172.64.86.94:80","216.24.57.4:80",
  "104.16.107.150:80","162.159.242.252:80","198.41.206.238:80","104.16.114.25:80",
  "104.17.17.249:80","91.193.58.101:80"
];

const EMAIL_ACCOUNTS = [
  { user: "himselfdev759@gmail.com", pass: "fpwncioanqohseix" },
  { user: "cryptolord25ss@gmail.com", pass: "lczszqjxovvbuxco" },
  { user: "unknownhimself6@gmail.com", pass: "uupfjdufriwrdgop" },
  { user: "arsheeqarsheeqq@gmail.com", pass: "pkkqfactxwkpvzgc" },
  { user: "managerhimself032@gmail.com", pass: "inagtgypnpyweleu" }
];

app.post('/api/destroy', async (req, res) => {
  const { queue } = req.body;
  let logs = [];
  let total = 0;
  const types = ['android-visible', 'android-invisible', 'ios-visible', 'ios-invisible', 'ultimate'];
  types.forEach(type => {
    (queue[type] || []).forEach(number => {
      EMAIL_ACCOUNTS.forEach(email => {
        PROXY_LIST.forEach(proxy => {
          total++;
          logs.push(`[${new Date().toLocaleTimeString()}] ${type} -> ${number} via ${proxy} (${email.user})`);
        });
      });
    });
  });
  res.json({ success: true, total, logs });
});

// ===== CATCH-ALL FRONTEND ROUTE (Express 4 compatible) =====
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});