/**
 * ChatPulse - WhatsApp Chat Analyzer
 * ----------------------------------
 * 100% Client-Side parsing, sentiment analysis, word cloud layout, and metrics.
 */

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar");
    const navItems = document.querySelectorAll(".nav-item");
    const appPages = document.querySelectorAll(".app-page");
    const pageTitle = document.getElementById("page-title");
    
    // File inputs
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const browseBtn = document.getElementById("browse-btn");
    const demoBtn = document.getElementById("demo-btn");
    const resetChatBtn = document.getElementById("reset-chat");
    const chatInfoPill = document.getElementById("chat-info-pill");
    const chatFilename = document.getElementById("chat-filename");
    const chatTypeBadge = document.getElementById("chat-type-badge");
    
    // Accordion triggers
    const accordionTriggers = document.querySelectorAll(".accordion-trigger");
    
    // Global data stores
    let parsedMessages = [];
    let chatStats = {};
    let activeCharts = {};
    let selectedWordCloudWord = null;

    // Word Cloud settings & canvas
    const wcCanvas = document.getElementById("wordcloud-canvas");
    const wcTooltip = document.getElementById("wordcloud-tooltip");
    const regenerateCloudBtn = document.getElementById("regenerate-cloud-btn");
    const cloudWordCountSelect = document.getElementById("cloud-word-count");
    const cloudSenderFilterSelect = document.getElementById("cloud-sender-filter");
    
    // Chat Explorer filters & items
    const explorerSearch = document.getElementById("explorer-search");
    const explorerSenderFilter = document.getElementById("explorer-sender-filter");
    const explorerSentimentFilter = document.getElementById("explorer-sentiment-filter");
    const explorerMessagesView = document.getElementById("chat-messages-view");
    const explorerMatchCount = document.getElementById("explorer-match-count");
    const explorerTotalCount = document.getElementById("explorer-total-count");

    // Lexicon for Sentiment Analysis (English & common Hinglish/Hindi terms)
    const sentimentLexicon = {
        // Positive words
        "love": 3, "loved": 3, "loves": 3, "loving": 3, "loveliest": 4, "lovely": 3,
        "good": 2, "great": 3, "awesome": 4, "nice": 2, "happy": 3, "best": 3,
        "perfect": 4, "beautiful": 3, "cool": 2, "hahaha": 2, "lol": 2, "lolz": 2,
        "haha": 2, "hehe": 1, "wow": 3, "superb": 4, "thanks": 2, "thank": 2,
        "agree": 2, "excellent": 4, "amazing": 4, "sweet": 2, "cute": 2, "fun": 3,
        "funny": 2, "yes": 1, "yep": 1, "yeah": 1, "glad": 3, "proud": 3, "congrats": 3,
        "congratulations": 4, "smart": 2, "intelligent": 3, "genius": 4, "helpful": 2,
        "trust": 2, "winner": 3, "victory": 3, "cheers": 2, "safe": 2, "party": 2,
        "enjoy": 2, "enjoyed": 2, "interest": 2, "valuable": 3, "excited": 4, "fine": 1,
        "sahi": 2, "accha": 2, "badhiya": 3, "mast": 3, "gorgeous": 4, "creative": 3,
        
        // Negative words
        "bad": -2, "hate": -3, "hated": -3, "hating": -3, "sad": -2, "worst": -4,
        "broken": -2, "ugly": -3, "crying": -2, "angry": -3, "no": -1, "never": -1,
        "stupid": -3, "annoyed": -2, "fake": -2, "wrong": -2, "bored": -2, "boring": -2,
        "hurt": -3, "pain": -2, "scared": -2, "fear": -2, "sarcastic": -1, "dump": -2,
        "sorry": -1, "cry": -1, "die": -4, "fool": -2, "disagree": -2, "ridiculous": -3,
        "waste": -2, "kill": -3, "hell": -3, "scam": -3, "cheat": -3, "shame": -2,
        "sick": -2, "dumb": -3, "disgust": -3, "guilty": -2, "jealous": -2, "failure": -3,
        "useless": -3, "weak": -2, "panic": -3, "crisis": -3, "ugly": -3, "shock": -2,
        "kharab": -2, "bekar": -2, "faltu": -2, "ghatiya": -3, "gussa": -2, "shutup": -3,

        // Emojis scoring
        "❤️": 3, "😍": 3, "😘": 3, "😂": 2, "🤣": 2, "😊": 2, "👍": 2, "🎉": 3, "🔥": 2, "✨": 2,
        "😭": -2, "😢": -2, "😡": -3, "😠": -3, "😒": -2, "👎": -2, "💩": -3, "🤡": -2, "💀": -1
    };

    // Standard English & Hinglish Stopwords for Word Cloud
    const stopWords = new Set([
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", 
        "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", 
        "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", 
        "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", 
        "heres", "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im", "ive", "if", "in", 
        "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor", 
        "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
        "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", 
        "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", 
        "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", 
        "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which", "while", 
        "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd", "youll", "youre", "youve", 
        "your", "yours", "yourself", "yourselves",
        
        // Hinglish/Indian slang stopwords
        "hai", "ko", "ki", "ka", "se", "aur", "bhi", "me", "hi", "ye", "toh", "he", "pe", "hu", "ho", "h", "tha", "thi", 
        "the", "kar", "karo", "raha", "rahi", "rhe", "rha", "kuch", "kya", "kyu", "kyon", "ek", "do", "bhai", "yaar", 
        "ab", "aaj", "kal", "par", "abhy", "na", "ne", "wo", "woh", "v", "ni", "nhi", "nahi", "kuch", "apna", "apne", "apni",
        "omitted", "media", "sticker", "image", "photo", "video", "document"
    ]);

    /* ==========================================================================
       Sidebar and Navigation Controls
       ========================================================================== */
    
    // Toggle sidebar collapse
    toggleSidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    // Navigation tab switching
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            if (item.classList.contains("disabled")) return;
            
            const targetTab = item.getAttribute("data-tab");
            
            // Update active state in nav
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            
            // Switch visible page
            appPages.forEach(page => {
                page.classList.remove("active");
                if (page.id === `page-${targetTab}`) {
                    page.classList.add("active");
                }
            });

            // Update top bar page title
            const tabName = item.querySelector(".nav-text").innerText;
            pageTitle.innerText = tabName;

            // Trigger specific page initializations if needed (e.g. Word Cloud render)
            if (targetTab === "wordcloud") {
                renderWordCloud();
            }
        });
    });

    // Accordion triggers for Guide Card
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const item = trigger.parentElement;
            const isActive = item.classList.contains("active");
            
            // Close all items first
            document.querySelectorAll(".accordion-item").forEach(el => el.classList.remove("active"));
            
            if (!isActive) {
                item.classList.add("active");
            }
        });
    });

    /* ==========================================================================
       File Upload & Drag-and-Drop
       ========================================================================== */

    // Drag-over styling
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        }, false);
    });

    // Drop file trigger
    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file && file.name.endsWith(".txt")) {
            processFile(file);
        } else {
            showToast("Invalid file! Please upload a WhatsApp exported .txt file.", "danger");
        }
    });

    // Browse click triggers hidden input
    browseBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) processFile(file);
    });

    // Reset Chat to upload another
    resetChatBtn.addEventListener("click", () => {
        // Clear data
        parsedMessages = [];
        chatStats = {};
        
        // Reset nav bar items disabled state
        navItems.forEach(item => {
            if (item.getAttribute("data-tab") !== "upload") {
                item.classList.add("disabled");
            } else {
                item.classList.add("active");
            }
        });

        // Switch to upload page
        appPages.forEach(page => {
            page.classList.remove("active");
            if (page.id === "page-upload") page.classList.add("active");
        });

        pageTitle.innerText = "Analyzer Setup";
        chatInfoPill.classList.add("hidden");
        fileInput.value = "";
        
        // Destroy existing ApexCharts objects to prevent overlapping re-renders
        Object.keys(activeCharts).forEach(key => {
            if (activeCharts[key] && typeof activeCharts[key].destroy === 'function') {
                activeCharts[key].destroy();
            }
        });
        activeCharts = {};

        showToast("Session reset. You can upload a new chat file now.", "success");
    });

    /* ==========================================================================
       The Brain: WhatsApp Parser Engine
       ========================================================================== */

    function processFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            parseChatData(fileContent, file.name);
        };
        reader.readAsText(file, "utf-8");
    }

    function parseChatData(content, fileName) {
        // Identify line breaks and clean up carriage returns
        const rawLines = content.split(/\r?\n/);
        
        parsedMessages = [];
        
        // Versatile regular expressions to match multiple WhatsApp formats
        // iOS Format: [DD/MM/YY, HH:MM:SS] Sender: Message
        const iosRegex = /^\[(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([APap][Mm]))?\]\s*(.*?):\s*(.*)/;
        
        // Android Format: DD/MM/YYYY, HH:MM - Sender: Message OR M/D/YY, H:MM AM/PM - Sender: Message
        const androidRegex = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([APap][Mm]))?\s+-\s+(.*?):\s*(.*)/;

        let currentMsg = null;

        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            if (line === "") continue;

            let match = line.match(androidRegex) || line.match(iosRegex);

            if (match) {
                // If we finished a previous message, push it to our array
                if (currentMsg) {
                    parsedMessages.push(currentMsg);
                }

                // Gather Regex Match Tokens
                let day = parseInt(match[1]);
                let month = parseInt(match[2]) - 1; // JS months are 0-11
                let year = parseInt(match[3]);
                if (year < 100) year += 2000; // Handle 2 digit years like '21'

                let hour = parseInt(match[4]);
                const minute = parseInt(match[5]);
                const second = match[6] ? parseInt(match[6]) : 0;
                const ampm = match[7];
                const sender = match[8].trim();
                const text = match[9] ? match[9].trim() : "";

                // Convert 12 hour AM/PM time format to standard 24 hours
                if (ampm) {
                    if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
                    if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
                }

                // WhatsApp exports can list dates in DD/MM or MM/DD format. We'll attempt parsing.
                // If month is > 11, it's highly likely US format (MM/DD/YYYY). Swap day and month.
                if (month > 11) {
                    const temp = day;
                    day = month + 1;
                    month = temp - 1;
                }

                const timestamp = new Date(year, month, day, hour, minute, second);

                // Ignore standard system messages (e.g. Encryption keys, group joins)
                if (sender.includes("added") || 
                    sender.includes("created group") || 
                    sender.includes("left") || 
                    sender.includes("changed") || 
                    sender.includes("joined") || 
                    sender.includes("security code") ||
                    text === "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Learn more.") {
                    currentMsg = null;
                    continue;
                }

                currentMsg = {
                    timestamp: timestamp,
                    sender: sender,
                    text: text,
                    words: text.split(/\s+/).filter(w => w !== "").length,
                    isMedia: text.includes("omitted") || text.includes("photo") || text.includes("video") || text.includes("sticker") || text.includes("image"),
                    isLink: /https?:\/\/[^\s]+/.test(text)
                };
            } else {
                // If the line doesn't match a date structure, it's a multi-line continuation of the active message
                if (currentMsg) {
                    currentMsg.text += " " + line;
                    currentMsg.words += line.split(/\s+/).filter(w => w !== "").length;
                    if (!currentMsg.isLink && /https?:\/\/[^\s]+/.test(line)) {
                        currentMsg.isLink = true;
                    }
                }
            }
        }

        // Push last compiled message
        if (currentMsg) {
            parsedMessages.push(currentMsg);
        }

        if (parsedMessages.length === 0) {
            showToast("Failed to parse chat. Ensure date formats are correct and standard.", "danger");
            return;
        }

        // Successfully parsed! Perform computations and render charts
        processStatistics(fileName);
    }

    /* ==========================================================================
       Statistical Aggregations & Calculations
       ========================================================================== */

    function processStatistics(fileName) {
        // 1. Basic Tallies
        let totalWords = 0;
        let totalMedia = 0;
        let totalLinks = 0;
        const sendersMap = {};
        const monthlyTimeline = {};
        const weeklyTimeline = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Sun - Sat
        const hourlyTimeline = Array(24).fill(0);
        const linksList = [];
        const emojiCounts = {};
        const emojiSenders = {};

        parsedMessages.forEach(msg => {
            totalWords += msg.words;
            if (msg.isMedia) totalMedia++;
            if (msg.isLink) {
                totalLinks++;
                const urls = msg.text.match(/https?:\/\/[^\s]+/g);
                if (urls) {
                    urls.forEach(url => linksList.push({ sender: msg.sender, url: url, timestamp: msg.timestamp }));
                }
            }

            // Group by Sender
            if (!sendersMap[msg.sender]) {
                sendersMap[msg.sender] = {
                    messages: 0,
                    words: 0,
                    media: 0,
                    links: 0,
                    sentimentScore: 0,
                    sentimentCount: 0
                };
            }
            sendersMap[msg.sender].messages++;
            sendersMap[msg.sender].words += msg.words;
            if (msg.isMedia) sendersMap[msg.sender].media++;
            if (msg.isLink) sendersMap[msg.sender].links++;

            // Monthly breakdown (YYYY-MM)
            const date = msg.timestamp;
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyTimeline[yearMonth] = (monthlyTimeline[yearMonth] || 0) + 1;

            // Day of Week breakdown
            weeklyTimeline[date.getDay()]++;

            // Hourly breakdown
            hourlyTimeline[date.getHours()]++;

            // Emojis mapping (highly robust combined pattern)
            const emojiRegex = /(?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]|[\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu;
            const emojis = msg.text.match(emojiRegex);
            if (emojis) {
                emojis.forEach(emoji => {
                    // Filter out standard numbers, symbols, and letters that have emoji codes
                    if (/^[0-9#*]$/.test(emoji)) return;
                    emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
                    
                    if (!emojiSenders[emoji]) emojiSenders[emoji] = {};
                    emojiSenders[emoji][msg.sender] = (emojiSenders[emoji][msg.sender] || 0) + 1;
                });
            }

            // NLP Sentiment Scores
            const sentiment = scoreSentiment(msg.text);
            msg.sentiment = sentiment.type;
            msg.sentimentScore = sentiment.score;

            sendersMap[msg.sender].sentimentScore += sentiment.score;
            sendersMap[msg.sender].sentimentCount++;
        });

        // 2. Average Senders count
        const uniqueSenders = Object.keys(sendersMap);
        const isGroup = uniqueSenders.length > 2;

        // 3. Timeline duration calculations
        const firstMsg = parsedMessages[0];
        const lastMsg = parsedMessages[parsedMessages.length - 1];
        const totalDurationDays = Math.ceil((lastMsg.timestamp - firstMsg.timestamp) / (1000 * 60 * 60 * 24)) || 1;

        // Group active days
        const activeDaysSet = new Set(parsedMessages.map(m => m.timestamp.toDateString()));
        const totalActiveDaysCount = activeDaysSet.size;

        // 4. Calculate Reply Latency (Response speed)
        const responseStats = calculateReplyTimes(parsedMessages);

        // Save into global object
        chatStats = {
            totalMessages: parsedMessages.length,
            totalWords: totalWords,
            totalMedia: totalMedia,
            totalLinks: totalLinks,
            senders: sendersMap,
            monthly: monthlyTimeline,
            weekly: weeklyTimeline,
            hourly: hourlyTimeline,
            links: linksList,
            emojis: emojiCounts,
            emojiSenders: emojiSenders,
            isGroup: isGroup,
            durationDays: totalDurationDays,
            activeDaysCount: totalActiveDaysCount,
            avgMsgPerDay: (parsedMessages.length / totalActiveDaysCount).toFixed(1),
            startDate: firstMsg.timestamp.toLocaleDateString(),
            endDate: lastMsg.timestamp.toLocaleDateString(),
            responseStats: responseStats
        };

        // 5. Update UI with compiled metrics
        updateDashboardUI(fileName);

        // 6. Confetti particle celebration!
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#6366f1", "#06b6d4", "#ec4899"]
        });
    }

    /* ==========================================================================
       Lexicon & Sentiment NLP Score Engine
       ========================================================================== */

    function scoreSentiment(text) {
        if (!text) return { score: 0, type: "neutral" };
        const cleanedText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
        const tokens = cleanedText.split(/\s+/);
        
        let score = 0;
        tokens.forEach(token => {
            if (sentimentLexicon[token]) {
                score += sentimentLexicon[token];
            }
        });

        // Scan also for specific emoji triggers explicitly
        for (let char of text) {
            if (sentimentLexicon[char]) {
                score += sentimentLexicon[char];
            }
        }

        let type = "neutral";
        if (score > 1) type = "positive";
        else if (score < -1) type = "negative";

        return { score: score, type: type };
    }

    /* ==========================================================================
       Reply Time / Response Latency Analyzer
       ========================================================================== */

    function calculateReplyTimes(messages) {
        const responseTimes = {}; // sender -> array of durations in minutes
        
        for (let i = 1; i < messages.length; i++) {
            const current = messages[i];
            const previous = messages[i - 1];

            // Only measure latency if the sender changed
            if (current.sender !== previous.sender) {
                const diffMs = current.timestamp - previous.timestamp;
                const diffMin = diffMs / (1000 * 60);

                // Cutoff at 12 hours (720 minutes). If people take longer, it's probably
                // just a new daily thread, not a delayed direct response in a conversation loop.
                if (diffMin < 720) {
                    if (!responseTimes[current.sender]) {
                        responseTimes[current.sender] = [];
                    }
                    responseTimes[current.sender].push(diffMin);
                }
            }
        }

        const averages = {};
        Object.keys(responseTimes).forEach(sender => {
            const list = responseTimes[sender];
            const sum = list.reduce((a, b) => a + b, 0);
            const avg = list.length > 0 ? sum / list.length : 0;
            averages[sender] = avg;
        });

        return averages;
    }

    function getResponseBadge(avgMinutes) {
        if (avgMinutes === 0) return { label: "N/A", class: "neutral" };
        if (avgMinutes < 2) return { label: "Speed Demon ⚡", class: "active" };
        if (avgMinutes < 15) return { label: "Active Responder 📱", class: "active" };
        if (avgMinutes < 120) return { label: "Patient Replier ☕", class: "neutral" };
        if (avgMinutes < 300) return { label: "Lazy Texter 🐢", class: "lazy" };
        return { label: "The Ghoster 👻", class: "ghost" };
    }

    /* ==========================================================================
       UI Builder and Layout Synchronizer
       ========================================================================== */

    function updateDashboardUI(fileName) {
        // Toggle Sidebar Items Enabled Status
        document.getElementById("nav-overview").classList.remove("disabled");
        document.getElementById("nav-timeline").classList.remove("disabled");
        document.getElementById("nav-engagement").classList.remove("disabled");
        document.getElementById("nav-sentiment").classList.remove("disabled");
        document.getElementById("nav-wordcloud").classList.remove("disabled");
        document.getElementById("nav-explorer").classList.remove("disabled");

        // Topbar Pill Information
        chatFilename.innerText = fileName;
        chatTypeBadge.innerText = chatStats.isGroup ? "Group Chat" : "Individual Chat";
        chatInfoPill.classList.remove("hidden");

        // Count up stats variables
        animateCounter("stat-messages", chatStats.totalMessages);
        animateCounter("stat-words", chatStats.totalWords);
        animateCounter("stat-media", chatStats.totalMedia);
        animateCounter("stat-links", chatStats.totalLinks);

        // Sidebar and Page navigation
        document.getElementById("nav-overview").click();

        // 1. Fill Summary Panel details
        document.getElementById("summary-dates").innerText = `${chatStats.startDate} - ${chatStats.endDate}`;
        document.getElementById("summary-duration").innerText = `${chatStats.durationDays} Days`;
        document.getElementById("summary-active-days").innerText = `${chatStats.activeDaysCount} Days`;
        document.getElementById("summary-senders-count").innerText = `${Object.keys(chatStats.senders).length} Members`;
        document.getElementById("summary-avg-msg-day").innerText = chatStats.avgMsgPerDay;

        // 2. Generate Highlights Insights
        generateHighlightInsights();

        // 3. Populate charts
        buildActivityCharts();

        // 4. Populate tables
        populateEngagementTables();

        // 5. Setup Emojis intelligence
        populateEmojiGrid();
        populateOverviewEmojiList();

        // 6. Setup Chat Explorer variables
        setupChatExplorer();
    }

    function animateCounter(elementId, endValue) {
        const el = document.getElementById(elementId);
        let start = 0;
        const duration = 1200; // ms
        const increment = Math.ceil(endValue / (duration / 16)); // ~60fps
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= endValue) {
                clearInterval(timer);
                el.innerText = endValue.toLocaleString();
            } else {
                el.innerText = start.toLocaleString();
            }
        }, 16);
    }

    function generateHighlightInsights() {
        const insightsList = document.getElementById("highlight-insights-list");
        insightsList.innerHTML = "";

        // Find most active sender
        let topSender = "";
        let maxMsgs = 0;
        Object.keys(chatStats.senders).forEach(sender => {
            if (chatStats.senders[sender].messages > maxMsgs) {
                maxMsgs = chatStats.senders[sender].messages;
                topSender = sender;
            }
        });

        // Find Busiest hour
        let busiestHour = 0;
        let maxHourMsgs = 0;
        chatStats.hourly.forEach((count, hr) => {
            if (count > maxHourMsgs) {
                maxHourMsgs = count;
                busiestHour = hr;
            }
        });
        const hourLabel = busiestHour >= 12 ? `${busiestHour === 12 ? 12 : busiestHour - 12} PM` : `${busiestHour === 0 ? 12 : busiestHour} AM`;

        // Insights list structure
        const insights = [
            {
                title: "Ultimate Chat Champion",
                desc: `<b>${topSender}</b> is the crown leader with <b>${maxMsgs.toLocaleString()}</b> messages.`,
                icon: "fa-crown",
                class: "pink"
            },
            {
                title: "Peak Hourly Peak Time",
                desc: `Activity peaks around <b>${hourLabel}</b>, registering <b>${maxHourMsgs.toLocaleString()}</b> total messages.`,
                icon: "fa-clock",
                class: "cyan"
            },
            {
                title: "Chat Density Quotient",
                desc: `An average of <b>${chatStats.avgMsgPerDay}</b> messages are exchanged on active chat days.`,
                icon: "fa-bolt",
                class: "indigo"
            }
        ];

        insights.forEach(item => {
            const div = document.createElement("div");
            div.className = "insight-item";
            div.innerHTML = `
                <div class="insight-item-icon ${item.class}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="insight-item-content">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            `;
            insightsList.appendChild(div);
        });
    }

    /* ==========================================================================
       ApexCharts Visual Rendering
       ========================================================================== */

    function buildActivityCharts() {
        // Custom color palette matching premium styles
        const colors = ["#6366f1", "#06b6d4", "#ec4899", "#f97316", "#10b981"];

        // A. MONTHLY VOLUME AREA CHART
        const monthlyData = Object.keys(chatStats.monthly).sort().map(key => {
            return { x: key, y: chatStats.monthly[key] };
        });

        const monthlyOptions = {
            series: [{
                name: 'Messages',
                data: monthlyData.map(d => d.y)
            }],
            chart: {
                type: 'area',
                height: 320,
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#9ca3af'
            },
            colors: [colors[0]],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [0, 90, 100]
                }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            xaxis: {
                categories: monthlyData.map(d => d.x),
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    formatter: function(val) { return Math.round(val); }
                }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: true } }
            },
            tooltip: { theme: 'dark' }
        };

        if (activeCharts['monthly']) activeCharts['monthly'].destroy();
        activeCharts['monthly'] = new ApexCharts(document.getElementById("monthly-chart"), monthlyOptions);
        activeCharts['monthly'].render();

        // B. WEEKLY BAR CHART
        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weeklyData = weekDays.map((day, idx) => chatStats.weekly[idx]);

        const weeklyOptions = {
            series: [{
                name: 'Messages',
                data: weeklyData
            }],
            chart: {
                type: 'bar',
                height: 260,
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#9ca3af'
            },
            colors: [colors[2]],
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '55%',
                    distributed: true
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: weekDays,
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)'
            },
            tooltip: { theme: 'dark' },
            legend: { show: false }
        };

        if (activeCharts['weekly']) activeCharts['weekly'].destroy();
        activeCharts['weekly'] = new ApexCharts(document.getElementById("weekly-chart"), weeklyOptions);
        activeCharts['weekly'].render();

        // C. HOURLY LINE CHART
        const hoursList = Array(24).fill(0).map((_, i) => `${String(i).padStart(2, '0')}:00`);
        const hourlyOptions = {
            series: [{
                name: 'Messages',
                data: chatStats.hourly
            }],
            chart: {
                type: 'line',
                height: 260,
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#9ca3af'
            },
            colors: [colors[1]],
            stroke: { curve: 'smooth', width: 3 },
            dataLabels: { enabled: false },
            xaxis: {
                categories: hoursList,
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)'
            },
            tooltip: { theme: 'dark' }
        };

        if (activeCharts['hourly']) activeCharts['hourly'].destroy();
        activeCharts['hourly'] = new ApexCharts(document.getElementById("hourly-chart"), hourlyOptions);
        activeCharts['hourly'].render();

        // D. CHAMPIONS HORIZONTAL BAR CHART (Top Senders)
        const sortedSenders = Object.keys(chatStats.senders).sort((a,b) => {
            return chatStats.senders[b].messages - chatStats.senders[a].messages;
        }).slice(0, 10); // Top 10 Senders

        const championsOptions = {
            series: [{
                name: 'Messages',
                data: sortedSenders.map(s => chatStats.senders[s].messages)
            }],
            chart: {
                type: 'bar',
                height: 320,
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#9ca3af'
            },
            colors: [colors[0]],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                    barHeight: '60%'
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) { return val.toLocaleString(); },
                style: { colors: ['#fff'] }
            },
            xaxis: {
                categories: sortedSenders,
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.03)'
            },
            tooltip: { theme: 'dark' }
        };

        if (activeCharts['champions']) activeCharts['champions'].destroy();
        activeCharts['champions'] = new ApexCharts(document.getElementById("champions-chart"), championsOptions);
        activeCharts['champions'].render();

        // E. AVERAGE WORDINESS
        const wordinessOptions = {
            series: [{
                name: 'Avg Words/Message',
                data: sortedSenders.map(s => {
                    const stats = chatStats.senders[s];
                    return parseFloat((stats.words / stats.messages).toFixed(1));
                })
            }],
            chart: {
                type: 'bar',
                height: 260,
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#9ca3af'
            },
            colors: [colors[2]],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '50%'
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: sortedSenders,
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)'
            },
            tooltip: { theme: 'dark' }
        };

        if (activeCharts['wordiness']) activeCharts['wordiness'].destroy();
        activeCharts['wordiness'] = new ApexCharts(document.getElementById("wordiness-chart"), wordinessOptions);
        activeCharts['wordiness'].render();

        // F. SENTIMENT DONUT CHART
        let posCount = 0, neuCount = 0, negCount = 0;
        parsedMessages.forEach(m => {
            if (m.sentiment === "positive") posCount++;
            else if (m.sentiment === "negative") negCount++;
            else neuCount++;
        });

        const sentimentOptions = {
            series: [posCount, neuCount, negCount],
            labels: ['Positive Mood 😊', 'Neutral Conversation 💬', 'Sarcastic / Negative Mood 😡'],
            chart: {
                type: 'donut',
                height: 280,
                background: 'transparent',
                foreColor: '#9ca3af'
            },
            colors: [colors[4], colors[1], colors[2]],
            stroke: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '72%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Messages',
                                formatter: function(w) {
                                    return w.globals.seriesTotals.reduce((a,b)=>a+b,0).toLocaleString();
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom',
                fontSize: '11px',
                horizontalAlign: 'center'
            },
            tooltip: { theme: 'dark' }
        };

        if (activeCharts['sentiment']) activeCharts['sentiment'].destroy();
        activeCharts['sentiment'] = new ApexCharts(document.getElementById("sentiment-donut-chart"), sentimentOptions);
        activeCharts['sentiment'].render();
    }

    /* ==========================================================================
       Data Tables population
       ========================================================================== */

    function populateEngagementTables() {
        // A. Speed Demon / Reply Speed Table
        const tbody = document.querySelector("#response-table tbody");
        tbody.innerHTML = "";

        const sortedSenders = Object.keys(chatStats.senders).sort((a,b) => {
            return chatStats.senders[b].messages - chatStats.senders[a].messages;
        });

        sortedSenders.forEach(sender => {
            const avgTime = chatStats.responseStats[sender] || 0;
            const badge = getResponseBadge(avgTime);
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="font-bold">${sender}</td>
                <td>${avgTime === 0 ? "N/A" : `${avgTime.toFixed(1)} mins`}</td>
                <td><span class="badge-status ${badge.class}">${badge.label}</span></td>
            `;
            tbody.appendChild(tr);
        });

        // B. Sentiment Leaderboard Table
        const sbody = document.querySelector("#sentiment-sender-table tbody");
        sbody.innerHTML = "";

        // Sort by average sentiment score
        const sentimentRanks = sortedSenders.map(sender => {
            const stats = chatStats.senders[sender];
            const avgSentiment = stats.sentimentCount > 0 ? (stats.sentimentScore / stats.sentimentCount) : 0;
            return { sender, score: avgSentiment };
        }).sort((a, b) => b.score - a.score);

        sentimentRanks.forEach(item => {
            let badgeText = "Balanced Conversations 💬";
            let badgeClass = "neutral";

            if (item.score > 0.3) { badgeText = "Super Cheerful & Positive ☀️"; badgeClass = "cheerful"; }
            else if (item.score > 0.05) { badgeText = "Positive Vibe ✨"; badgeClass = "cheerful"; }
            else if (item.score < -0.3) { badgeText = "High Cynicism / Toxic 🌶️"; badgeClass = "toxic"; }
            else if (item.score < -0.05) { badgeText = "Sarcastic Moodboard 🎭"; badgeClass = "sarcastic"; }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="font-bold">${item.sender}</td>
                <td class="${item.score > 0 ? 'text-success' : item.score < 0 ? 'text-cyan' : ''}">${item.score.toFixed(3)}</td>
                <td><span class="sentiment-badge ${badgeClass}">${badgeText}</span></td>
            `;
            sbody.appendChild(tr);
        });
    }

    function populateEmojiGrid() {
        const container = document.getElementById("emoji-frequency-container");
        container.innerHTML = "";

        const sortedEmojis = Object.keys(chatStats.emojis).sort((a,b) => {
            return chatStats.emojis[b] - chatStats.emojis[a];
        });

        // A. Top Emoji King
        if (sortedEmojis.length > 0) {
            let emojiKing = "No one";
            let maxEmojiCount = 0;

            const sendersList = Object.keys(chatStats.senders);
            sendersList.forEach(sender => {
                let senderEmojis = 0;
                sortedEmojis.forEach(emoji => {
                    senderEmojis += (chatStats.emojiSenders[emoji][sender] || 0);
                });
                if (senderEmojis > maxEmojiCount) {
                    maxEmojiCount = senderEmojis;
                    emojiKing = sender;
                }
            });

            document.getElementById("emoji-king-name").innerText = emojiKing;
            document.getElementById("emoji-king-stat").innerText = `${maxEmojiCount} total emojis sent`;
        } else {
            document.getElementById("emoji-king-name").innerText = "None";
            document.getElementById("emoji-king-stat").innerText = "No emojis parsed";
        }

        // B. Populate grid with top 8 emojis
        const topCount = Math.min(sortedEmojis.length, 8);
        
        // Count total emojis for percentage
        const totalEmojisParsed = Object.values(chatStats.emojis).reduce((a,b)=>a+b, 0) || 1;

        for (let i = 0; i < topCount; i++) {
            const emoji = sortedEmojis[i];
            const count = chatStats.emojis[emoji];
            const percent = ((count / totalEmojisParsed) * 100).toFixed(1);

            // Find top sender for this specific emoji
            let topSenderForEmoji = "";
            let maxCountForEmoji = 0;
            Object.keys(chatStats.emojiSenders[emoji]).forEach(sender => {
                if (chatStats.emojiSenders[emoji][sender] > maxCountForEmoji) {
                    maxCountForEmoji = chatStats.emojiSenders[emoji][sender];
                    topSenderForEmoji = sender;
                }
            });

            const card = document.createElement("div");
            card.className = "emoji-item-card";
            card.innerHTML = `
                <span class="emoji-symbol">${emoji}</span>
                <span class="emoji-count">${count}</span>
                <span class="emoji-percentage">${percent}% of total</span>
                <span style="font-size:0.7rem; color:#9ca3af; display:block; margin-top:6px;">Top: ${topSenderForEmoji} (${maxCountForEmoji})</span>
            `;
            container.appendChild(card);
        }

        if (sortedEmojis.length === 0) {
            container.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding: 20px; color:#6b7280;'>No emojis used in this chat.</div>";
        }

        // C. Populate Emoji Leaderboard List (Progress Bars)
        const leaderboardContainer = document.getElementById("emoji-leaderboard-list");
        leaderboardContainer.innerHTML = "";

        const topLeaderboardCount = Math.min(sortedEmojis.length, 6);
        const maxEmojiOccurrences = sortedEmojis.length > 0 ? chatStats.emojis[sortedEmojis[0]] : 0;

        for (let i = 0; i < topLeaderboardCount; i++) {
            const emoji = sortedEmojis[i];
            const count = chatStats.emojis[emoji];
            const barWidthPercent = maxEmojiOccurrences > 0 ? (count / maxEmojiOccurrences) * 100 : 0;

            const item = document.createElement("div");
            item.className = "emoji-leaderboard-item";
            item.innerHTML = `
                <span class="emoji-leaderboard-char">${emoji}</span>
                <div class="emoji-leaderboard-bar-wrapper">
                    <div class="emoji-leaderboard-bar" style="width: ${barWidthPercent}%"></div>
                </div>
                <span class="emoji-leaderboard-count">${count.toLocaleString()}</span>
            `;
            leaderboardContainer.appendChild(item);
        }

        if (sortedEmojis.length === 0) {
            leaderboardContainer.innerHTML = "<div style='text-align:center; padding: 20px; color:#6b7280; font-size: 0.85rem;'>No emojis to rank.</div>";
        }
    }

    function populateOverviewEmojiList() {
        const container = document.getElementById("overview-emoji-list");
        if (!container) return;
        container.innerHTML = "";

        const sortedEmojis = Object.keys(chatStats.emojis).sort((a,b) => {
            return chatStats.emojis[b] - chatStats.emojis[a];
        });

        const topOverviewCount = Math.min(sortedEmojis.length, 5);
        const maxEmojiOccurrences = sortedEmojis.length > 0 ? chatStats.emojis[sortedEmojis[0]] : 0;

        for (let i = 0; i < topOverviewCount; i++) {
            const emoji = sortedEmojis[i];
            const count = chatStats.emojis[emoji];
            const barWidthPercent = maxEmojiOccurrences > 0 ? (count / maxEmojiOccurrences) * 100 : 0;

            const item = document.createElement("div");
            item.className = "emoji-leaderboard-item";
            item.innerHTML = `
                <span class="emoji-leaderboard-char">${emoji}</span>
                <div class="emoji-leaderboard-bar-wrapper">
                    <div class="emoji-leaderboard-bar" style="width: ${barWidthPercent}%"></div>
                </div>
                <span class="emoji-leaderboard-count">${count.toLocaleString()}</span>
            `;
            container.appendChild(item);
        }

        if (sortedEmojis.length === 0) {
            container.innerHTML = "<div style='text-align:center; padding: 20px; color:#6b7280; font-size: 0.85rem;'>No emojis used in this chat.</div>";
        }
    }

    /* ==========================================================================
       Canvas Word Cloud rendering algorithm
       ========================================================================== */

    function renderWordCloud() {
        const selectedSender = cloudSenderFilterSelect.value;
        const maxWords = parseInt(cloudWordCountSelect.value);

        // Compile word frequency list
        const wordFreq = {};
        parsedMessages.forEach(msg => {
            // Apply sender filtering
            if (selectedSender !== "all" && msg.sender !== selectedSender) return;
            if (msg.isMedia) return; // Skip media markers

            // Clean up text
            const cleanText = msg.text.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"")
                .replace(/\s+/g, " ");
            
            const words = cleanText.split(/\s+/);
            
            words.forEach(word => {
                if (word.length <= 2) return; // Skip very short words
                if (stopWords.has(word)) return; // Skip stopwords

                wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
        });

        // Convert to sorted array
        const sortedWords = Object.keys(wordFreq).map(key => {
            return { text: key, size: wordFreq[key] };
        }).sort((a,b) => b.size - a.size).slice(0, maxWords);

        // Canvas context drawing setup
        const ctx = wcCanvas.getContext("2d");
        const width = wcCanvas.width;
        const height = wcCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (sortedWords.length === 0) {
            ctx.fillStyle = "#6b7280";
            ctx.font = "16px Plus Jakarta Sans";
            ctx.textAlign = "center";
            ctx.fillText("Not enough word volume to build cloud.", width/2, height/2);
            return;
        }

        // Normalizing word sizes for canvas layout
        const maxCount = sortedWords[0].size;
        const minCount = sortedWords[sortedWords.length - 1].size;
        
        const maxFontSize = 48;
        const minFontSize = 12;

        const placedWords = [];

        // Check if rectangle overlaps with placed items
        function intersects(r1, r2) {
            return !(r2.x > r1.x + r1.w || 
                     r2.x + r2.w < r1.x || 
                     r2.y > r1.y + r1.h || 
                     r2.y + r2.h < r1.y);
        }

        const colorsList = ["#6366f1", "#06b6d4", "#ec4899", "#f97316", "#10b981", "#8b5cf6", "#3b82f6"];

        sortedWords.forEach((word, index) => {
            // Size mapping formula
            let size = minFontSize;
            if (maxCount !== minCount) {
                size = minFontSize + ((word.size - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize);
            }

            ctx.font = `bold ${Math.round(size)}px Plus Jakarta Sans`;
            const textMetrics = ctx.measureText(word.text);
            const w = textMetrics.width + 10;
            const h = size + 6;

            // Spiral placing algorithm (Archimedean Spiral)
            let angle = 0;
            let placed = false;
            
            let cx = width / 2;
            let cy = height / 2;

            // Introduce slight randomization in centers
            cx += (Math.random() - 0.5) * 40;
            cy += (Math.random() - 0.5) * 30;

            const maxAttempts = 300;
            let attempt = 0;

            while (!placed && attempt < maxAttempts) {
                // Archimedean Spiral mapping
                const r = 3 * angle;
                const x = cx + r * Math.cos(angle) - w/2;
                const y = cy + r * Math.sin(angle) - h/2;

                const currentRect = { x: x, y: y, w: w, h: h, text: word.text, size: word.size, fontSize: size };

                // Bounds boundaries check
                if (x >= 10 && x + w <= width - 10 && y >= 10 && y + h <= height - 10) {
                    let collision = false;
                    for (let j = 0; j < placedWords.length; j++) {
                        if (intersects(currentRect, placedWords[j])) {
                            collision = true;
                            break;
                        }
                    }

                    if (!collision) {
                        currentRect.color = colorsList[index % colorsList.length];
                        placedWords.push(currentRect);
                        placed = true;
                    }
                }

                angle += 0.2;
                attempt++;
            }
        });

        // Draw words on canvas
        placedWords.forEach(word => {
            ctx.fillStyle = word.color;
            ctx.font = `bold ${Math.round(word.fontSize)}px Plus Jakarta Sans`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            
            // Draw word
            ctx.fillText(word.text, word.x, word.y);
        });

        // Track placements for mouse tooltips
        wcCanvas.onmousemove = function(e) {
            const rect = wcCanvas.getBoundingClientRect();
            // Scaling factors for responsive visual canvas
            const scaleX = width / rect.width;
            const scaleY = height / rect.height;

            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            let hoverWord = null;
            for (let i = 0; i < placedWords.length; i++) {
                const w = placedWords[i];
                if (mx >= w.x && mx <= w.x + w.w && my >= w.y && my <= w.y + w.h) {
                    hoverWord = w;
                    break;
                }
            }

            if (hoverWord) {
                wcCanvas.style.cursor = "pointer";
                wcTooltip.style.left = `${e.clientX - rect.left + 15}px`;
                wcTooltip.style.top = `${e.clientY - rect.top + 15}px`;
                wcTooltip.innerHTML = `Word: <b style="color:${hoverWord.color}">${hoverWord.text}</b><br>Occurrences: <b>${hoverWord.size}</b>`;
                wcTooltip.style.opacity = 1;
            } else {
                wcCanvas.style.cursor = "default";
                wcTooltip.style.opacity = 0;
            }
        };

        wcCanvas.onmouseleave = function() {
            wcTooltip.style.opacity = 0;
        };
    }

    // Regenerate button event triggers
    regenerateCloudBtn.addEventListener("click", renderWordCloud);

    /* ==========================================================================
       Interactive WhatsApp Mock Explorer Setup
       ========================================================================== */

    function setupChatExplorer() {
        // Fill sender list dropdown
        explorerSenderFilter.innerHTML = "<option value='all'>All Senders</option>";
        cloudSenderFilterSelect.innerHTML = "<option value='all'>Everyone</option>";

        const sendersList = Object.keys(chatStats.senders).sort();
        sendersList.forEach(sender => {
            const opt = document.createElement("option");
            opt.value = sender;
            opt.innerText = sender;
            explorerSenderFilter.appendChild(opt);

            const optCloud = document.createElement("option");
            optCloud.value = sender;
            optCloud.innerText = sender;
            cloudSenderFilterSelect.appendChild(optCloud);
        });

        // Title update
        document.getElementById("explorer-header-title").innerText = chatStats.isGroup ? "WhatsApp Group Chat" : "Private Chat Window";
        document.getElementById("explorer-header-subtitle").innerText = `${parsedMessages.length.toLocaleString()} total logged messages`;

        explorerTotalCount.innerText = parsedMessages.length;

        // Force initial render of messages
        renderExplorerMessages();
    }

    function renderExplorerMessages() {
        const keyword = explorerSearch.value.toLowerCase().trim();
        const selectedSender = explorerSenderFilter.value;
        const selectedSentiment = explorerSentimentFilter.value;

        explorerMessagesView.innerHTML = "";

        // Map senders to unique styling classes for colors
        const senderColorMap = {};
        Object.keys(chatStats.senders).forEach((sender, i) => {
            senderColorMap[sender] = `sender-col-${i % 8}`;
        });

        let matchesCount = 0;
        const fragment = document.createDocumentFragment();

        // Render at most 250 matching messages to maintain visual UI speed
        for (let i = 0; i < parsedMessages.length; i++) {
            const msg = parsedMessages[i];

            // Apply Keyword Search Filter
            if (keyword !== "" && !msg.text.toLowerCase().includes(keyword)) continue;

            // Apply Sender Filter
            if (selectedSender !== "all" && msg.sender !== selectedSender) continue;

            // Apply Sentiment Filter
            if (selectedSentiment !== "all" && msg.sentiment !== selectedSentiment) continue;

            matchesCount++;

            // Only append the DOM representation of the first 250 elements to prevent page freeze
            if (matchesCount <= 250) {
                const isSent = i % 2 === 0; // Alternating Sent/Received alignment for mock realism

                const msgRow = document.createElement("div");
                msgRow.className = `chat-msg-row ${isSent ? 'sent' : 'received'}`;

                // Process Text markup (links highlight)
                let renderedText = msg.text;
                if (msg.isLink) {
                    renderedText = msg.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="chat-link">$1</a>');
                }

                // Media omitted highlight
                let textClass = "";
                if (msg.isMedia) {
                    textClass = "media-omitted";
                    renderedText = `<i class="fa-solid fa-camera mr-2"></i>${msg.text}`;
                }

                // Sentiment Icon Badge Indicator
                let sentimentIcon = "";
                if (msg.sentiment === "positive") {
                    sentimentIcon = '<i class="fa-solid fa-face-smile-beam sentiment-indicator positive" title="Positive Vibe"></i>';
                } else if (msg.sentiment === "negative") {
                    sentimentIcon = '<i class="fa-solid fa-face-angry sentiment-indicator negative" title="Cynical / Negative Vibe"></i>';
                }

                const senderColorClass = senderColorMap[msg.sender] || "sender-col-0";
                const timeString = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                msgRow.innerHTML = `
                    <div class="chat-bubble">
                        <span class="chat-bubble-sender ${senderColorClass}">${msg.sender}</span>
                        <div class="chat-bubble-text ${textClass}">${renderedText}</div>
                        <div class="chat-bubble-meta">
                            ${sentimentIcon}
                            <span>${timeString}</span>
                        </div>
                    </div>
                `;
                fragment.appendChild(msgRow);
            }
        }

        explorerMessagesView.appendChild(fragment);
        explorerMatchCount.innerText = matchesCount.toLocaleString();

        if (matchesCount === 0) {
            explorerMessagesView.innerHTML = `
                <div class="empty-explorer-state">
                    <i class="fa-regular fa-face-frown-open"></i>
                    <p>No messages match your applied filters.</p>
                </div>
            `;
        }
    }

    // Add filter change triggers for Explorer
    explorerSearch.addEventListener("input", renderExplorerMessages);
    explorerSenderFilter.addEventListener("change", renderExplorerMessages);
    explorerSentimentFilter.addEventListener("change", renderExplorerMessages);

    /* ==========================================================================
       The Demo Chat Generator (Mock Data Setup)
       ========================================================================== */

    demoBtn.addEventListener("click", () => {
        const sampleLines = [
            "31/05/2026, 09:30 AM - Alex: Hey everyone! Welcome to the Project Hackathon 2026 prep group! 🎉 Let's build something awesome.",
            "31/05/2026, 09:31 AM - Sarah: Absolutely loved the idea! ❤️ We should focus on creating a stunning UI/UX.",
            "31/05/2026, 09:32 AM - Mike: I agree. The frontend is super important. I checked out some cool designs here: https://dribbble.com, they are beautiful.",
            "31/05/2026, 09:34 AM - Emma: Hey guys, super excited to join! 🚀 I think we should do something related to data science or NLP. What do you think?",
            "31/05/2026, 09:36 AM - Mike: NLP sounds extremely great! We can make an intelligent WhatsApp Chat Analyzer that does sentiment analysis.",
            "31/05/2026, 09:40 AM - Sarah: Oh wow, yes! That is a genius idea! 🧠 People love insights on how much they chat and who the ghoster is lol.",
            "31/05/2026, 09:42 AM - Alex: Haha indeed. I am definitely not the ghoster, I reply in seconds. ⚡",
            "31/05/2026, 09:45 AM - Emma: <Media omitted>",
            "31/05/2026, 09:46 AM - Emma: Sent a mockup design we can follow. Let me know if you guys like it.",
            "31/05/2026, 09:50 AM - Alex: This is perfect! The glassmorphism card layouts look incredibly premium.",
            "31/05/2026, 10:02 AM - Mike: I am worried about the parsing engine. What if the date formats are different for android and ios?",
            "31/05/2026, 10:04 AM - Sarah: That's a wrong worry. We can write regular expressions to handle all cases easily. Don't panic.",
            "31/05/2026, 10:06 AM - Mike: Ah okay, glad to hear that. I hate when dates break our code, it is the worst feeling ever. 😡",
            "31/05/2026, 10:10 AM - Emma: Agree, debugging regex is hell. But we can do it! 👍",
            "31/05/2026, 11:15 AM - Alex: Hey, I created the repository. You can check it here: https://github.com/alex/chatpulse. Let's start coding!",
            "31/05/2026, 11:20 AM - Sarah: Awesome, thanks Alex! I will push the initial HTML layout in a few mins.",
            "31/05/2026, 01:40 PM - Mike: Guys, let's take a break. I am feeling extremely bored and hungry. 🍕",
            "31/05/2026, 01:45 PM - Emma: Same! I am getting some coffee. Let's catch up in an hour.",
            "31/05/2026, 03:00 PM - Alex: Back to work! Sarah, your dashboard styles are beautiful. I love the violet gradients.",
            "31/05/2026, 03:05 PM - Sarah: Thank you! I spent hours tweaking the backdrop filter. Glad you liked it! 😊",
            "31/05/2026, 05:20 PM - Mike: <Media omitted>",
            "31/05/2026, 05:22 PM - Mike: Check out this funny meme about git merge conflicts haha.",
            "31/05/2026, 05:25 PM - Emma: Haha so true, merge conflicts are a nightmare. 😭 Never want to see them again.",
            "31/05/2026, 08:30 PM - Alex: Alright guys, we are almost done! The Word Cloud fits great and the Sentiment scores are perfectly balanced.",
            "31/05/2026, 08:35 PM - Sarah: Excellent progress team! Let's deploy it. It is an amazing project, we are definitely winning this hackathon! 🏆",
            "31/05/2026, 08:40 PM - Mike: Cheers to the team! Super proud of what we built. 🍻"
        ].join("\n");

        parseChatData(sampleLines, "demo_group_chat.txt");
        showToast("Loaded demo group chat successfully!", "success");
    });

    /* ==========================================================================
       Global Toast Notifications
       ========================================================================== */

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        const toastIcon = document.getElementById("toast-icon");
        const toastMsg = document.getElementById("toast-message");

        toastMsg.innerText = message;
        toast.className = "toast-notification animate-fade-in";

        if (type === "success") {
            toastIcon.className = "fa-solid fa-circle-check toast-icon text-success";
            toast.style.borderColor = "rgba(16, 185, 129, 0.25)";
        } else if (type === "danger") {
            toastIcon.className = "fa-solid fa-circle-exclamation toast-icon text-cyan";
            toast.style.borderColor = "rgba(239, 68, 68, 0.25)";
        }

        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3500);
    }
});
