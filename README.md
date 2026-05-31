# ChatPulse | Premium WhatsApp Chat Analyzer

ChatPulse is a visually premium, high-performance, client-side web application designed to analyze exported WhatsApp chat logs (both individual and group chats) and generate interactive visualizations and deep behavioral insights. 

Built using a **Privacy-First Architecture**, the application parses, compiles, and renders all statistics locally inside the browser. **Your chat files are never uploaded to any server, database, or API endpoint**, ensuring absolute confidentiality for your personal conversations.

---

## 📂 Project Architecture

The codebase is organized as a lightweight, modular Single-Page Application (SPA) inside the root directory:

```text
whatsapp-analyzer/
├── README.md                  # This comprehensive project documentation and deployment guide
├── index.html                 # Core Single-Page HTML structure, sidebar navigations, and glass grids
├── style.css                  # Custom stylesheet for glassmorphism panels, neon variables, and responsiveness
└── app.js                     # The core logic: Date parser, Sentiment lexicon, custom Word Cloud, and chart builders
```

### File Breakdown:
* **`index.html`**: Establishes the layout structure of the application. Integrates sticky responsive navigations, dynamic grid layouts, custom accordion guides, mock explorer windows, and imports high-quality external CDN dependencies (Plus Jakarta Sans font, Font Awesome icons, ApexCharts, and Canvas-Confetti).
* **`style.css`**: Configures custom CSS variables for dark theme accents (Electric Indigo, Cyan, Hot Pink), fine glass borders (`backdrop-filter: blur(16px)`), hover translations, pulsating upload zone rings, custom scrollbars, and styled WhatsApp chat bubbles.
* **`app.js`**: Houses the multi-format date parser, regular expressions for media and links, custom dictionary-based Sentiment Lexicon, response-speed calculators, dynamic canvas-based Word Cloud layout, simulated explorer filter indexing, and ApexCharts initialization templates.

---

## 🛠️ Main Features & Insights

### 1. File Parsing & Quick Setup
* **Robust date parsing**: Seamlessly parses iOS formats (`[DD/MM/YY, HH:MM:SS] Sender: Message`) and Android formats (`DD/MM/YYYY, HH:MM - Sender: Message`), auto-detecting locale-based timestamp variations and correctly merging multi-line messages.
* **Smart Filter System**: Automatically filters out system notifications (joins, leaves, encryption key warnings, profile picture changes).
* **One-Click Mock Generator**: Click **"Try with Demo Group Chat"** to instantly populate the dashboard with realistic conversations for testing and demonstration.

### 2. High-Level Metrics (Overview Page)
* **Live Tally Counters**: Counts **Total Messages**, **Total Words**, **Media Shared** (media-omitted indicators), and **Links Shared** (clickable hyperlinks list) with smooth count-up animations.
* **Conversation Summary Details**: Displays start date, end date, total calendar duration, active days count, average daily density, and sender counts.

### 3. Timeline Analysis
* **Monthly Volume Trend**: Area chart with color-gradient shading representing message growth trends.
* **Weekly Distribution Pattern**: Bar chart showing activity indexes on different days of the week (Sunday through Saturday).
* **Hourly Profile Density**: Peak time-of-day analyzer representing standard hourly message volumes.

### 4. Engagement & Latency Metrics
* **Chat Champions**: Horizontal ranked bar chart of the group's most active participants.
* **Wordiness Quotient**: Bar chart representing average words per message.
* **Speed Demon vs The Ghoster**: Calculates direct reply times between consecutive senders and tags participants with fun badges:
  - `< 2 mins`: **Speed Demon ⚡**
  - `2 - 15 mins`: **Active Responder 📱**
  - `15 - 120 mins`: **Patient Replier ☕**
  - `> 120 mins`: **The Ghoster 👻** (Delayed replies)

### 5. Emoji Intelligence & Sentiment Analytics
* **Most Used Emojis (Overview Dashboard)**: A live progress-bar card built directly on the overview tab showing your top 5 emojis and their exact counts.
* **Sender Moodboard**: Ranks senders from "Super Cheerful Vibe" to "Cynical/Sarcastic" using an in-browser lexicon-based sentiment engine.
* **Sentiment Ratio**: Visual representation of the overall emotional undertone (Positive, Neutral, Negative) of the chat.
* **Emoji Grid**: Top 8 emojis mapped with percentage ratios and the contact who used them the most.

### 6. Interactive Word Cloud
* **Spiral Coordinate Algorithm**: Custom-engineered canvas rendering using Archimedean spiral coordinates and collision bounding-boxes.
* **Stop-words filtering**: Automatically filters out standard English and common Hindi stop-words (`hai`, `ki`, `ko`, `yaar`, `bhai`, etc.).
* **Active Tooltips**: Hovering over words on the canvas highlights them and triggers a dynamic tooltip showing their exact frequencies.

### 7. WhatsApp Chat Explorer
* **WhatsApp Theme Recreation**: Real-time rendering of chat bubbles matching WhatsApp's modern dark layout, complete with custom bubble tails and distinct colors for each sender.
* **Search & Filters**: Search keywords or filter threads by sender and emotional sentiment. Highlights hyperlinks dynamically.

---

## 🚀 How to Run the Project Locally in Chrome

Since ChatPulse is a pure client-side application, running it requires **zero installation**!

1. Copy the absolute file path below:
   ```text
   file:///C:/Users/KIIT/.gemini/antigravity/scratch/whatsapp-analyzer/index.html
   ```
2. Paste it into the URL bar of your **Google Chrome** browser and press Enter.
3. Drag & drop your exported WhatsApp `.txt` file, or click **"Try with Demo Group Chat"**!

---

## 🌐 Free 1-Click Deployment Guide

Because ChatPulse does not require backend servers or databases, you can host it online for free in seconds!

### Option A: Netlify Drop (Takes 20 seconds)
1. Open your browser and navigate to [Netlify Drop](https://app.netlify.com/drop).
2. Locate your project folder on your computer: `C:\Users\KIIT\.gemini\antigravity\scratch\whatsapp-analyzer`.
3. Drag the entire `whatsapp-analyzer` folder and drop it into the Netlify browser window.
4. **Netlify will instantly host the application and give you a shareable `https://...` link!**

### Option B: Vercel (Takes 30 seconds)
1. Go to [Vercel](https://vercel.com/) and sign up or log in.
2. Drag and drop the `whatsapp-analyzer` folder into Vercel’s upload dashboard.
3. Vercel will deploy the site and provide a free public domain name.

---

## 🔒 Privacy & Security Blueprint
* **Browser Sandbox**: The JavaScript `FileReader` API accesses file streams directly from your operating system into browser RAM.
* **No Server Footprint**: No external HTTP APIs, REST endpoints, or server-side sockets are active.
* **Offline Readiness**: All charts, styles, and word cloud compilations function 100% offline once the page has loaded.
