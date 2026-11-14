/**
 * ==============================================================================
 * THIỆP ĐIỆN TỬ TÌNH YÊU - CLIENT JAVASCRIPT (PHIÊN BẢN TÍCH HỢP NÂNG CAO)
 * 1. Dùng Google Sheets làm Database trực tiếp (qua link CSV)
 * 2. Hộp thư phản hồi nhanh gửi thẳng về Telegram Bot
 * 3. Hộp Thư Kỷ Niệm (Archive), Khóa ngày tương lai, Typewriter effect
 * 4. Tự động dự phòng an toàn (data.json hoặc nội bộ) nếu chưa cấu hình
 * ==============================================================================
 */

/* ==============================================================================
   0. CẤU HÌNH TÍCH HỢP THỰC TẾ (GOOGLE APPS SCRIPT & GOOGLE SHEETS)
   Điền các thông số của bạn vào đây để kích hoạt tính năng!
   ============================================================================== */
const INTEGRATION_CONFIG = {
  // 1. Link Web App Google Apps Script nhận tin nhắn gửi về Google Sheet
  // (Dán URL nhận được sau khi Triển khai / Deploy file Code.gs vào đây)
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx6wr8uSgQZFp7JDy8L8IiU9M-QYe4BzIru_PX7guJc9su7S6h-RolQvnng4ckVZ36K/exec",

  // 2. Link xuất bản Google Sheets dạng CSV (Để đọc nội dung các bức thư)
  // URL bảng tính của bạn: https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/edit
  GOOGLE_SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/gviz/tq?tqx=out:csv",

};

/* ==============================================================================
   1. DỮ LIỆU DỰ PHÒNG NỘI BỘ (FALLBACK DATA)
   Tự động kích hoạt khi chưa có Google Sheets hoặc mất mạng
   ============================================================================== */
const EMBEDDED_DATA = {
  config: {
    passcode: "0508",
    anniversaryDate: "2026-07-26",
    recipientName: "Em Bé Của Anh",
    senderName: "Người thương của em ❤️",
    musicUrl: "https://res.cloudinary.com/yowk0aay/video/upload/v1794639745/%C4%91%E1%BB%83_d%C3%A0nh_cho_em.mp3"
  },
  letters: [
  
    {
      date: "2026-11-14",
      letterNumber: "Bức thư tình #01",
      title: "Hôm Nay: Nắng Ấm Dịu Dàng Giữa Mùa Đông",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Nụ cười của em là ánh mặt trời ấm áp nhất ☀️",
      message: [
        "Gửi em, mảnh ghép dịu dàng nhất của cuộc đời anh,",
        "Hôm nay trời có chút se se lạnh, em nhớ mặc áo ấm khi ra ngoài nhé. Sáng nay thức dậy, điều đầu tiên anh nghĩ đến chính là nụ cười của em.",
        "Gửi cho em những lời văn có vẻ hơi ngây ngô nhưng chứa đầy trân thành từ nơi anh. Tình yêu nơi em là sự ngọt ngào và ấm áp nhất mà anh được nhận",
        "Đôi khi anh có vụng về khi đón nhận tình cảm ấy mong em hãy nhẹ nhàng nói cho anh hiểu điều em đang muốn nhé "
      ],
      question: {
        prompt: "Hôm nay em muốn cùng anh làm điều gì nhất nè?",
        options: [
          "Xem phim",
          "Chơi game nè",
          "Nghe anh kể chuyện",
          "Chỉ cần bên nhau là được 🥰"
        ]
      }
    },
    {
      date: "2026-11-15",
      letterNumber: "Bức thư tình #02",
      title: "Ngày Mai: Lời Hẹn Hò Cuối Tuần Mong Chờ",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
      caption: "Ngày mai chúng mình lại có hẹn với nhau 💕",
      message: [
        "Bức thư này được anh viết sẵn cho ngày mai...",
        "Cuối tuần rồi, hãy gác lại hết những âu lo và dành trọn vẹn thời gian cho chúng mình em nhé! Anh đã chuẩn bị một kế hoạch nhỏ thật ngọt ngào dành riêng cho em.",
        "Hẹn gặp lại em vào một ngày mai tràn ngập nắng ấm và hạnh phúc!"
      ],
      question: {
        prompt: "Kế hoạch ngày mai em hào hứng nhất điều gì?",
        options: [
          "Ngủ nướng thêm một chút",
          "Buổi hẹn hò bất ngờ",
          "Được ăn món em thích",
          "Được anh đón đi chơi ✨"
        ]
      }
    }
  ],
  fallbackLetter: {
    letterNumber: "Bức thư tình đặc biệt",
    title: "Bức Thư Tình Gửi Người Anh Thương",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    caption: "Mỗi ngày trôi qua đều là một ngày yêu em 💖",
    message: [
      "Gửi em bé đáng yêu của anh,",
      "Hôm nay anh chưa kịp cập nhật bức thư mới vào trang nhật ký, nhưng tình cảm anh dành cho em thì chưa bao giờ vơi bớt cả.",
      "Cảm ơn em đã luôn là nguồn năng lượng tích cực và dịu dàng nhất của anh. Hãy nhớ uống nhiều nước, ăn uống đúng giờ và giữ nụ cười thật tươi trên môi nhé!",
      "Anh yêu em nhiều hơn ngày hôm qua và ít hơn ngày mai một chút!"
    ],
    question: {
      prompt: "Hôm nay em có nhớ anh nhiều không?",
      options: [
        "Rất rất nhiều! 💕",
        "Nhiều hơn cả hôm qua 🥰",
        "Nhớ cả ngày lẫn đêm 🌙",
        "Không thể đếm xuể ✨"
      ]
    }
  }
};

/* ==============================================================================
   2. BIẾN TOÀN CỤC & QUẢN LÝ TRẠNG THÁI (APP STATE)
   ============================================================================== */
let appData = EMBEDDED_DATA;
let activeLetter = null;
let todayDateString = "";

const state = {
  currentPin: "",
  isUnlocked: false,
  isEnvelopeOpen: false,
  isLetterRevealed: false,
  isAudioPlaying: false,
  hugCount: 0,
  isTypingDone: false,
  typingTimeout: null,
  audioContext: null
};

/* ==============================================================================
   3. DOM ELEMENTS
   ============================================================================== */
const DOM = {
  // Screens
  lockScreen: document.getElementById("lock-screen"),
  envelopeScreen: document.getElementById("envelope-screen"),
  letterScreen: document.getElementById("letter-screen"),
  
  // Navigation
  archiveToggleBtn: document.getElementById("archive-toggle-btn"),
  openArchiveFromFooterBtn: document.getElementById("open-archive-from-footer-btn"),
  musicToggleBtn: document.getElementById("music-toggle-btn"),
  bgAudio: document.getElementById("bg-audio"),
  ambientCanvas: document.getElementById("ambient-canvas"),

  // Lock screen
  pinDots: document.querySelectorAll(".pin-dot"),
  pinMessage: document.getElementById("pin-message"),
  numpad: document.getElementById("numpad"),
  backspaceBtn: document.getElementById("backspace-btn"),
  hintBtn: document.getElementById("hint-btn"),
  passcodeHint: document.getElementById("passcode-hint"),

  // Envelope
  envelope: document.getElementById("envelope"),
  waxSeal: document.getElementById("wax-seal"),
  tapSealHint: document.getElementById("tap-seal-hint"),
  peekText: document.getElementById("peek-text"),

  // Letter elements
  vintageLetter: document.getElementById("vintage-letter"),
  letterNumber: document.getElementById("letter-number"),
  letterDate: document.getElementById("letter-date"),
  loveDaysCount: document.getElementById("love-days-count"),
  loveTimeDetail: document.getElementById("love-time-detail"),
  polaroidImg: document.getElementById("polaroid-image"),
  polaroidCaption: document.getElementById("polaroid-caption"),
  letterSalutation: document.getElementById("letter-salutation"),
  typewriterContent: document.getElementById("typewriter-content"),
  typewriterCursor: document.getElementById("typewriter-cursor"),
  skipTypingBtn: document.getElementById("skip-typing-btn"),
  signatureName: document.getElementById("signature-name"),

  // Daily Question elements
  dailyQuestionBox: document.getElementById("daily-question-box"),
  questionPrompt: document.getElementById("question-prompt"),
  questionOptions: document.getElementById("question-options"),
  questionFeedback: document.getElementById("question-feedback"),

  // Telegram & Google Sheets Reply elements
  wishSelectionBox: document.getElementById("wish-selection-box"),
  wishTagsGrid: document.getElementById("wish-tags-grid"),
  wishOtherToggle: document.getElementById("wish-other-toggle"),
  wishCustomContainer: document.getElementById("wish-custom-container"),
  wishCustomInput: document.getElementById("wish-custom-input"),
  replyTextInput: document.getElementById("reply-text-input"),
  replyCharCounter: document.getElementById("reply-char-counter"),
  sendReplyBtn: document.getElementById("send-reply-btn"),
  sendIcon: document.getElementById("send-icon"),
  sendText: document.getElementById("send-text"),
  replyStatus: document.getElementById("reply-status"),

  // Footer & Hug elements
  sendHugBtn: document.getElementById("send-hug-btn"),
  hugCounter: document.getElementById("hug-counter"),
  hugFeedback: document.getElementById("hug-feedback"),
  rewatchBtn: document.getElementById("rewatch-btn"),
  heartsContainer: document.getElementById("hearts-container"),

  // Archive Modal elements
  archiveModal: document.getElementById("archive-modal"),
  archiveBackdrop: document.getElementById("archive-backdrop"),
  closeArchiveBtn: document.getElementById("close-archive-btn"),
  archiveTodayText: document.getElementById("archive-today-text"),
  archiveCardsList: document.getElementById("archive-cards-list"),

  // Toast
  toastNotification: document.getElementById("toast-notification"),
  toastMessage: document.getElementById("toast-message"),
  toastIcon: document.getElementById("toast-icon")
};

/* ==============================================================================
   4. KHỞI TẠO ỨNG DỤNG (INITIALIZATION)
   ============================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  // Lấy ngày hôm nay theo hệ thống máy (Định dạng YYYY-MM-DD)
  todayDateString = getTodayFormatted();
  DOM.archiveTodayText.textContent = formatDateToVietnamese(todayDateString);

  // Tải dữ liệu (Ưu tiên Google Sheets -> data.json -> Embedded Data)
  await loadData();

  // Tìm bức thư của ngày hôm nay
  selectLetterForToday();

  // Khởi tạo các thành phần giao diện & sự kiện
  setupEventListeners();
  initAmbientPetals();
  calculateDaysInLove();
  registerServiceWorker();
});

function getTodayFormatted(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateToVietnamese(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = daysOfWeek[d.getDay()];
  
  return `${dayName}, ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ==============================================================================
   5. BỘ PHÂN TÍCH CSV & TẢI DỮ LIỆU TỪ GOOGLE SHEETS
   ============================================================================== */

/**
 * Trình phân tích CSV thuần (Xử lý dấu ngoặc kép, dấu phẩy trong văn bản, xuống dòng)
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Bỏ qua dấu nháy kép thoát
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Chuẩn hóa định dạng ngày từ Google Sheets (hỗ trợ cả YYYY-MM-DD và DD/MM/YYYY)
 */
function normalizeDate(rawDate) {
  if (!rawDate) return "";
  rawDate = rawDate.trim();
  // Nếu là DD/MM/YYYY -> đổi thành YYYY-MM-DD
  if (rawDate.includes("/")) {
    const p = rawDate.split("/");
    if (p.length === 3) {
      const day = p[0].padStart(2, "0");
      const month = p[1].padStart(2, "0");
      const year = p[2].length === 2 ? "20" + p[2] : p[2];
      return `${year}-${month}-${day}`;
    }
  }
  return rawDate;
}

/**
 * Tải dữ liệu từ Google Sheets CSV
 */
async function fetchGoogleSheetsLetters(csvUrl) {
  try {
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) return null;

    // Hàng đầu tiên là tiêu đề cột
    const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("ngay"));
    const titleIdx = headers.findIndex(h => h.includes("title") || h.includes("tieude"));
    const imgIdx = headers.findIndex(h => h.includes("image") || h.includes("img") || h.includes("anh"));
    const msgIdx = headers.findIndex(h => h.includes("message") || h.includes("noidung") || h.includes("thu"));
    const captionIdx = headers.findIndex(h => h.includes("caption") || h.includes("chuthich"));
    const numberIdx = headers.findIndex(h => h.includes("number") || h.includes("sothu"));
    const questionIdx = headers.findIndex(h => h.includes("question") || h.includes("cauhoi"));

    const letters = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = dateIdx !== -1 ? row[dateIdx] : "";
      const date = normalizeDate(rawDate);
      if (!date) continue;

      const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : "Thư Tình Gửi Em";
      const imageUrl = imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
      const rawMessage = msgIdx !== -1 && row[msgIdx] ? row[msgIdx] : "Thương gửi em yêu...";
      
      // Tách các đoạn văn theo dấu xuống dòng
      const message = rawMessage.split(/\r?\n|\n\n/).map(p => p.trim()).filter(p => p.length > 0);
      const caption = captionIdx !== -1 && row[captionIdx] ? row[captionIdx] : "Mỗi khoảnh khắc đều có em ✨";
      const letterNumber = numberIdx !== -1 && row[numberIdx] ? row[numberIdx] : `Bức thư #${i}`;

      let question = null;
      if (questionIdx !== -1 && row[questionIdx]) {
        question = {
          prompt: row[questionIdx],
          options: ["Đồng ý luôn nè! 💕", "Thích lắm cơ 🥰", "Chỉ cần bên anh ✨", "Hết nước chấm 💖"]
        };
      }

      letters.push({
        date,
        letterNumber,
        title,
        imageUrl,
        caption,
        message,
        question
      });
    }

    return letters.length > 0 ? letters : null;
  } catch (err) {
    console.error("Lỗi khi tải từ Google Sheets:", err);
    return null;
  }
}

/**
 * Tải toàn bộ dữ liệu ứng dụng:
 * 1. Nạp data.json
 * 2. Nếu có GOOGLE_SHEET_CSV_URL, nạp tiếp từ Google Sheets và ghi đè danh sách thư
 */
async function loadData() {
  // Bước 1: Nạp file data.json làm nền tảng
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (response.ok) {
      appData = await response.json();
      console.log("✅ Đã tải dữ liệu nền từ data.json");
    } else {
      appData = EMBEDDED_DATA;
    }
  } catch (err) {
    appData = EMBEDDED_DATA;
  }

  // Bước 2: Kiểm tra cấu hình Google Sheets
  if (INTEGRATION_CONFIG.GOOGLE_SHEET_CSV_URL && INTEGRATION_CONFIG.GOOGLE_SHEET_CSV_URL.trim() !== "") {
    console.log("📊 Đang đồng bộ thư từ Google Sheets...");
    const sheetLetters = await fetchGoogleSheetsLetters(INTEGRATION_CONFIG.GOOGLE_SHEET_CSV_URL);
    if (sheetLetters) {
      appData.letters = sheetLetters;
      console.log(`🎉 Đã nạp thành công ${sheetLetters.length} bức thư từ Google Sheets!`);
      showToast("Đã cập nhật thư mới từ Google Sheets! 📊✨", "💌");
    } else {
      console.warn("⚠️ Không thể đọc Google Sheets, sử dụng dữ liệu mặc định");
    }
  }
}

/**
 * Chọn bức thư của ngày hôm nay
 */
function selectLetterForToday() {
  const letters = appData.letters || [];
  
  // Tìm bức thư khớp ngày hôm nay
  let match = letters.find(l => l.date === todayDateString);

  if (match) {
    activeLetter = match;
  } else {
    // Nếu hôm nay chưa có dữ liệu mới, kiểm tra ngày mẫu 2026-11-14 hoặc dùng fallback
    const sampleToday = letters.find(l => l.date === "2026-11-14");
    if (sampleToday && todayDateString.startsWith("2026-11")) {
      activeLetter = sampleToday;
    } else {
      activeLetter = {
        ...appData.fallbackLetter,
        date: todayDateString
      };
    }
  }

  renderCurrentLetter();
}

/**
 * Render dữ liệu bức thư đang chọn vào HTML
 */
function renderCurrentLetter() {
  if (!activeLetter) return;

  DOM.letterNumber.textContent = activeLetter.letterNumber || "Bức thư tình";
  DOM.letterDate.textContent = formatDateToVietnamese(activeLetter.date || todayDateString);
  DOM.polaroidImg.src = activeLetter.imageUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
  DOM.polaroidCaption.textContent = activeLetter.caption || "Bình yên bên em ✨";
  DOM.letterSalutation.textContent = activeLetter.title || `Gửi ${appData.config.recipientName || "Em"}`;
  DOM.signatureName.textContent = appData.config.senderName || "Người thương của em ❤️";
  DOM.peekText.textContent = `Thư gửi: ${activeLetter.date}`;

  renderDailyQuestion(activeLetter.question);
}

function renderDailyQuestion(questionObj) {
  if (!questionObj || !questionObj.prompt) {
    DOM.dailyQuestionBox.style.display = "none";
    return;
  }

  DOM.dailyQuestionBox.style.display = "block";
  DOM.questionPrompt.textContent = questionObj.prompt;
  DOM.questionFeedback.textContent = "";
  DOM.questionOptions.innerHTML = "";

  (questionObj.options || []).forEach(optText => {
    const btn = document.createElement("button");
    btn.className = "question-opt-btn";
    btn.innerHTML = `<span>${optText}</span><span class="opt-check">🤍</span>`;

    btn.addEventListener("click", () => {
      DOM.questionOptions.querySelectorAll(".question-opt-btn").forEach(b => {
        b.classList.remove("selected");
        const check = b.querySelector(".opt-check");
        if (check) check.textContent = "🤍";
      });

      btn.classList.add("selected");
      const currentCheck = btn.querySelector(".opt-check");
      if (currentCheck) currentCheck.textContent = "💖";

      DOM.questionFeedback.textContent = "Anh đã ghi nhớ câu trả lời đáng yêu của em rồi nhé! 🥰";
      playHeartPopSound();
      spawnHeartsExplosion(12);

      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    });

    DOM.questionOptions.appendChild(btn);
  });
}

/* ==============================================================================
   6. HỘP THƯ PHẢN HỒI NHANH VỀ TELEGRAM BOT
   ============================================================================== */

/**
 * Mã hóa ký tự HTML an toàn trước khi gửi đến Telegram (tránh lỗi parse_mode HTML)
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Thu thập các lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
 */
function getSelectedWishes() {
  const selectedTags = Array.from(document.querySelectorAll(".wish-tag-btn.selected"));
  if (selectedTags.length === 0) {
    return "Không chọn";
  }

  const wishes = [];
  selectedTags.forEach(btn => {
    const wishVal = btn.dataset.wish;
    if (wishVal === "Khác") {
      const customVal = DOM.wishCustomInput ? DOM.wishCustomInput.value.trim() : "";
      if (customVal) {
        wishes.push(`Khác: ${customVal}`);
      } else {
        wishes.push("Khác");
      }
    } else if (wishVal) {
      wishes.push(wishVal);
    }
  });

  return wishes.length > 0 ? wishes.join(", ") : "Không chọn";
}

/**
 * Gửi tin nhắn phản hồi về Telegram Bot API (Kèm số lượt ôm & điều muốn làm)
 */
async function sendTelegramMessage(text, hugCount = 0, todayWish = "Không chọn") {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = INTEGRATION_CONFIG;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || TELEGRAM_BOT_TOKEN.trim() === "" || TELEGRAM_CHAT_ID.trim() === "") {
    return {
      success: false,
      isConfigMissing: true,
      message: "Chưa cấu hình Telegram Bot"
    };
  }

  const letterDate = activeLetter ? activeLetter.date : todayDateString;
  const letterTitle = activeLetter ? activeLetter.title : "Thiệp Tình Yêu";
  const now = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const formattedText = 
    `💌 <b>CÓ LỜI NHẮN MỚI TỪ NGƯỜI THƯƠNG!</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📅 <b>Thư ngày:</b> ${letterDate} (<i>${escapeHTML(letterTitle)}</i>)\n` +
    `⏰ <b>Thời gian gửi:</b> ${now}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🤗 <b>Lượt gửi ôm:</b> ${hugCount} cái ôm\n` +
    `✨ <b>Điều muốn làm:</b> ${escapeHTML(todayWish)}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Lời nhắn của em:</b>\n` +
    `<i>"${escapeHTML(text)}"</i>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💖 <i>(Gửi tự động từ website Thiệp Tình Yêu)</i>`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedText,
        parse_mode: "HTML"
      })
    });

    const result = await response.json();
    return { success: result.ok };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Xử lý sự kiện bấm nút gửi phản hồi vào Google Sheets qua Apps Script
 * Đóng gói đủ 4 trường: cardDate, message, hugCount, todayWish
 */
async function handleSendReply() {
  const replyInput = DOM.replyTextInput;
  const statusElem = DOM.replyStatus;
  const message = replyInput.value.trim();

  // Kiểm tra nội dung rỗng
  if (!message) {
    statusElem.className = "reply-status warning";
    statusElem.textContent = "Em ơi, hãy viết vài dòng nhắn gửi trước khi bấm gửi nhé! 💕";
    replyInput.focus();
    return;
  }

  // Thu thập 4 thông số:
  // 1. Ngày của bức thiệp hiện tại đang xem
  const cardDate = activeLetter ? (activeLetter.date || todayDateString) : todayDateString;
  // 2. Số lần bấm nút "Gửi một cái ôm" trên bức thư này
  const hugCount = state.hugCount || 0;
  // 3. Lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
  const todayWish = getSelectedWishes();

  // Khóa nút bấm & bật trạng thái loading để tránh bấm nhiều lần
  DOM.sendReplyBtn.disabled = true;
  DOM.sendReplyBtn.classList.add("loading");
  DOM.sendText.textContent = "Đang gửi...";
  statusElem.className = "reply-status";
  statusElem.textContent = "Đang gửi lời nhắn của em vào nhật ký...";

  let isSuccess = false;
  let responseErrorMsg = "";

  // Gửi trực tiếp đến Google Apps Script Web App
  if (INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL && INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL.trim() !== "") {
    try {
      // Dùng text/plain để tránh preflight CORS OPTIONS của trình duyệt
      const response = await fetch(INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          cardDate: cardDate,
          message: message,
          hugCount: hugCount,
          todayWish: todayWish
        })
      });

      try {
        const jsonRes = await response.json();
        if (jsonRes.status === "success") {
          isSuccess = true;
        } else {
          responseErrorMsg = jsonRes.message || "Lỗi lưu vào Google Sheet";
        }
      } catch (jsonErr) {
        if (response.ok || response.type === "opaque") {
          isSuccess = true;
        }
      }
    } catch (fetchErr) {
      console.warn("Lỗi gửi đến Google Apps Script:", fetchErr);
      responseErrorMsg = "Không thể kết nối đến Google Sheets (Vui lòng kiểm tra quyền truy cập Web App)";
    }
  } else {
    statusElem.className = "reply-status warning";
    statusElem.textContent = "⚠️ Bạn chưa dán link Web App vào GOOGLE_SCRIPT_URL ở đầu file script.js!";
    DOM.sendReplyBtn.disabled = false;
    DOM.sendReplyBtn.classList.remove("loading");
    DOM.sendText.textContent = "Gửi lời nhắn";
    showToast("Hãy điền GOOGLE_SCRIPT_URL trong script.js!", "⚠️", 4000);
    return;
  }

  // Gửi tiếp về Telegram nếu có cấu hình (Gửi kèm số lượt ôm & điều muốn làm)
  if (INTEGRATION_CONFIG.TELEGRAM_BOT_TOKEN && INTEGRATION_CONFIG.TELEGRAM_CHAT_ID) {
    sendTelegramMessage(message, hugCount, todayWish);
  }

  // Khôi phục trạng thái nút bấm
  DOM.sendReplyBtn.disabled = false;
  DOM.sendReplyBtn.classList.remove("loading");
  DOM.sendText.textContent = "Gửi lời nhắn";

  if (isSuccess) {
    // GỬI THÀNH CÔNG: Xóa trắng ô nhập liệu & reset lựa chọn
    replyInput.value = "";
    DOM.replyCharCounter.textContent = "0/500";

    // Reset lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
    document.querySelectorAll(".wish-tag-btn").forEach(btn => btn.classList.remove("selected"));
    if (DOM.wishCustomInput) DOM.wishCustomInput.value = "";
    if (DOM.wishCustomContainer) DOM.wishCustomContainer.style.display = "none";

    statusElem.className = "reply-status success";
    statusElem.textContent = "Lời nhắn của em đã được gửi đi thành công! 💌";

    // Pháo tim bay lượn & giai điệu vui tươi
    spawnHeartsExplosion(24);
    playSuccessMelody();
    showToast("Lời nhắn đã được lưu vào Google Sheet! 💌", "✨", 4000);

    if ("vibrate" in navigator) {
      navigator.vibrate([50, 40, 50]);
    }
  } else {
    statusElem.className = "reply-status error";
    statusElem.textContent = `❌ ${responseErrorMsg || "Chưa thể gửi lúc này"}. Em thử lại nhé!`;
  }
}

/* ==============================================================================
   7. XỬ LÝ MÀN HÌNH KHÓA PASSCODE
   ============================================================================== */
function handlePinInput(digit) {
  if (state.currentPin.length >= 4) return;

  state.currentPin += digit;
  updatePinDisplay();
  playSoftBeep(520, 0.08);

  if (state.currentPin.length === 4) {
    verifyPin();
  }
}

function handleBackspace() {
  if (state.currentPin.length > 0) {
    state.currentPin = state.currentPin.slice(0, -1);
    updatePinDisplay();
    playSoftBeep(380, 0.06);
    DOM.pinMessage.textContent = "";
  }
}

function updatePinDisplay() {
  DOM.pinDots.forEach((dot, index) => {
    if (index < state.currentPin.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function verifyPin() {
  const targetPin = (appData.config && appData.config.passcode) || "0508";

  if (state.currentPin === targetPin) {
    playSuccessMelody();
    DOM.pinMessage.style.color = "#15803d";
    DOM.pinMessage.textContent = "Mật mã chính xác! Đang mở... 💖";

    setTimeout(() => {
      transitionScreen(DOM.lockScreen, DOM.envelopeScreen);
      state.isUnlocked = true;
      startBackgroundMusic();
    }, 600);
  } else {
    playErrorBuzz();
    const pinDisplay = document.getElementById("pin-display");
    pinDisplay.classList.add("shake");
    DOM.pinMessage.style.color = "#dc2626";
    DOM.pinMessage.textContent = "Mật mã chưa đúng rồi nè, thử lại nhé... 🥺";

    if ("vibrate" in navigator) {
      navigator.vibrate([60, 40, 60]);
    }

    setTimeout(() => {
      pinDisplay.classList.remove("shake");
      state.currentPin = "";
      updatePinDisplay();
    }, 700);
  }
}

/* ==============================================================================
   8. HIỆU ỨNG MỞ PHONG BÌ & CON DẤU SÁP
   ============================================================================== */
function openEnvelope() {
  if (state.isEnvelopeOpen) return;
  state.isEnvelopeOpen = true;

  playWaxSealCrackSound();

  DOM.envelope.classList.add("opening");
  DOM.tapSealHint.style.opacity = "0";
  spawnMiniHeartsAround(DOM.waxSeal);

  setTimeout(() => {
    transitionScreen(DOM.envelopeScreen, DOM.letterScreen, () => {
      startTypewriter();
    });
  }, 1100);
}

function transitionScreen(fromScreen, toScreen, callback) {
  fromScreen.classList.remove("active");
  setTimeout(() => {
    toScreen.classList.add("active");
    if (callback) callback();
  }, 350);
}

/* ==============================================================================
   9. BỘ ĐẾM SỐ NGÀY YÊU NHAU (LOVE COUNTER)
   ============================================================================== */
function calculateDaysInLove() {
  const anniversaryStr = (appData.config && appData.config.anniversaryDate) || "2026-26-07";
  const startDate = new Date(anniversaryStr);
  const today = new Date();
  
  const diffTime = today - startDate;
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  animateCounter(DOM.loveDaysCount, diffDays, 1400);

  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  const months = Math.floor(remainingDays / 30);
  
  let detailStr = "từng ngày qua đều ngập tràn yêu thương...";
  if (years > 0) {
    detailStr = `Hơn ${years} năm ${months > 0 ? months + " tháng " : ""}bên nhau ngọt ngào!`;
  }
  DOM.loveTimeDetail.textContent = detailStr;
}

function animateCounter(element, targetValue, duration) {
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(targetValue * easeProgress);

    element.textContent = currentValue.toLocaleString("vi-VN");

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = targetValue.toLocaleString("vi-VN");
    }
  }

  requestAnimationFrame(updateNumber);
}

/* ==============================================================================
   10. HIỆU ỨNG ĐÁNH MÁY (TYPEWRITER EFFECT)
   ============================================================================== */
function startTypewriter() {
  clearTimeout(state.typingTimeout);
  state.isTypingDone = false;

  const paragraphs = activeLetter.message || [
    "Thương gửi em yêu,",
    "Cảm ơn em vì đã đến và sưởi ấm thế giới của anh mỗi ngày!"
  ];

  let currentParagraphIndex = 0;
  let charIndex = 0;
  DOM.typewriterContent.innerHTML = "";
  DOM.typewriterCursor.style.display = "inline-block";
  DOM.skipTypingBtn.style.display = "inline-block";

  function typeNextChar() {
    if (state.isTypingDone) return;

    if (currentParagraphIndex < paragraphs.length) {
      const currentPara = paragraphs[currentParagraphIndex];
      
      let pElem = DOM.typewriterContent.children[currentParagraphIndex];
      if (!pElem) {
        pElem = document.createElement("p");
        DOM.typewriterContent.appendChild(pElem);
      }

      if (charIndex < currentPara.length) {
        pElem.textContent += currentPara[charIndex];
        charIndex++;
        const delay = Math.floor(Math.random() * 18) + 22;
        state.typingTimeout = setTimeout(typeNextChar, delay);
      } else {
        currentParagraphIndex++;
        charIndex = 0;
        state.typingTimeout = setTimeout(typeNextChar, 220);
      }
    } else {
      finishTypewriter();
    }
  }

  typeNextChar();
}

function skipTypewriter() {
  clearTimeout(state.typingTimeout);
  const paragraphs = activeLetter.message || [];
  DOM.typewriterContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join("");
  finishTypewriter();
}

function finishTypewriter() {
  state.isTypingDone = true;
  DOM.typewriterCursor.style.display = "none";
  DOM.skipTypingBtn.style.display = "none";
}

/* ==============================================================================
   11. HỘP THƯ KỶ NIỆM (ARCHIVE DRAWER)
   ============================================================================== */
function openArchiveModal() {
  renderArchiveCards();
  DOM.archiveModal.classList.add("active");
  DOM.archiveModal.setAttribute("aria-hidden", "false");
}

function closeArchiveModal() {
  DOM.archiveModal.classList.remove("active");
  DOM.archiveModal.setAttribute("aria-hidden", "true");
}

function renderArchiveCards() {
  const letters = appData.letters || [];
  DOM.archiveCardsList.innerHTML = "";

  const sortedLetters = [...letters].sort((a, b) => b.date.localeCompare(a.date));

  sortedLetters.forEach(letter => {
    const isFuture = letter.date > todayDateString;
    const isCurrentReading = activeLetter && activeLetter.date === letter.date;
    const isToday = letter.date === todayDateString;

    const card = document.createElement("div");
    card.className = `archive-card ${isFuture ? "locked" : ""} ${isCurrentReading ? "active-reading" : ""}`;

    let statusBadge = "";
    if (isFuture) {
      statusBadge = `<span class="status-chip locked">🔒 Khóa</span>`;
    } else if (isCurrentReading) {
      statusBadge = `<span class="status-chip current">Đang đọc</span>`;
    } else if (isToday) {
      statusBadge = `<span class="status-chip open">✨ Hôm nay</span>`;
    } else {
      statusBadge = `<span class="status-chip open">💌 Đọc lại</span>`;
    }

    card.innerHTML = `
      <img src="${letter.imageUrl}" alt="${letter.title}" class="archive-card-thumb" loading="lazy">
      <div class="archive-card-info">
        <span class="archive-card-date-badge">${formatDateToVietnamese(letter.date)}</span>
        <h4 class="archive-card-title">${letter.title}</h4>
        <p class="archive-card-meta">${letter.letterNumber || "Thư kỷ niệm"}</p>
      </div>
      <div class="archive-card-action">
        ${statusBadge}
      </div>
    `;

    card.addEventListener("click", () => {
      if (isFuture) {
        card.classList.add("shake-subtle");
        setTimeout(() => card.classList.remove("shake-subtle"), 400);

        showToast("Bí mật của ngày mai, quay lại sau nhé! 🤫✨", "🔒");

        if ("vibrate" in navigator) {
          navigator.vibrate([40, 30, 40]);
        }
      } else {
        activeLetter = letter;
        renderCurrentLetter();
        closeArchiveModal();

        if (!state.isUnlocked) {
          showToast("Mở khóa thiệp trước đã em nhé! 💖", "💌");
        } else {
          if (DOM.envelopeScreen.classList.contains("active")) {
            openEnvelope();
          } else {
            showToast(`Đang đọc: ${letter.letterNumber}`, "📖");
            startTypewriter();
          }
        }
      }
    });

    DOM.archiveCardsList.appendChild(card);
  });
}

/* ==============================================================================
   12. TOAST THÔNG BÁO DỄ THƯƠNG
   ============================================================================== */
let toastTimeout = null;
function showToast(message, icon = "✨", duration = 3000) {
  DOM.toastMessage.textContent = message;
  DOM.toastIcon.textContent = icon;
  DOM.toastNotification.classList.add("active");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toastNotification.classList.remove("active");
  }, duration);
}

/* ==============================================================================
   13. TƯƠNG TÁC "GỬI MỘT CÁI ÔM" (HEART EXPLOSION)
   ============================================================================== */
function handleSendHug() {
  state.hugCount++;
  DOM.hugCounter.textContent = state.hugCount;

  const hugMessages = [
    "Cảm ơn cái ôm thật chặt của em! 💕",
    "Gửi lại em ngàn nụ hôn ngọt ngào! 🌸",
    "Trái tim anh đang đập rộn ràng vì em nè! 💓",
    "Em là điều tuyệt vời nhất thế gian! ✨",
    "Một cái ôm ấm áp xua tan mọi mỏi mệt! 🥰"
  ];

  const randomMsg = hugMessages[state.hugCount % hugMessages.length];
  DOM.hugFeedback.textContent = randomMsg;
  DOM.hugFeedback.style.color = "#e11d48";
  DOM.hugFeedback.style.fontWeight = "600";

  if ("vibrate" in navigator) {
    navigator.vibrate([40, 60, 40]);
  }

  playHeartPopSound();
  spawnHeartsExplosion(24);
}

function spawnHeartsExplosion(count) {
  const heartIcons = ["💖", "💕", "💓", "💗", "🌸", "✨", "💌", "🥰", "🌹"];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-heart-item";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];

    const startX = Math.random() * 85 + 5;
    const driftX = (Math.random() - 0.5) * 140;
    const rotation = (Math.random() - 0.5) * 90;
    const fontSize = Math.floor(Math.random() * 18) + 18;
    const duration = (Math.random() * 1.4 + 2.4).toFixed(2);
    const delay = (Math.random() * 0.4).toFixed(2);

    heart.style.left = `${startX}vw`;
    heart.style.fontSize = `${fontSize}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.setProperty("--drift-x", `${driftX}px`);
    heart.style.setProperty("--rot-deg", `${rotation}deg`);

    DOM.heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 200);
  }
}

function spawnMiniHeartsAround(targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const mini = document.createElement("div");
    mini.style.position = "fixed";
    mini.style.left = `${centerX}px`;
    mini.style.top = `${centerY}px`;
    mini.style.fontSize = "18px";
    mini.style.pointerEvents = "none";
    mini.style.zIndex = "999";
    mini.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    mini.textContent = i % 2 === 0 ? "✨" : "💖";

    document.body.appendChild(mini);

    const angle = (i / 12) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    requestAnimationFrame(() => {
      mini.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      mini.style.opacity = "0";
    });

    setTimeout(() => mini.remove(), 850);
  }
}

/* ==============================================================================
   14. ĐIỀU KHIỂN ÂM THANH & NHẠC NỀN
   ============================================================================== */
function toggleMusic() {
  if (state.isAudioPlaying) {
    pauseBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
}

function startBackgroundMusic() {
  if (appData.config && appData.config.musicUrl) {
    DOM.bgAudio.src = appData.config.musicUrl;
  }

  DOM.bgAudio.play()
    .then(() => {
      state.isAudioPlaying = true;
      DOM.musicToggleBtn.classList.add("playing");
      DOM.musicToggleBtn.setAttribute("title", "Đang phát nhạc (Nhấp để dừng)");
    })
    .catch(() => {
      initWebAudioFallback();
      state.isAudioPlaying = true;
      DOM.musicToggleBtn.classList.add("playing");
    });
}

function pauseBackgroundMusic() {
  DOM.bgAudio.pause();
  state.isAudioPlaying = false;
  DOM.musicToggleBtn.classList.remove("playing");
  DOM.musicToggleBtn.setAttribute("title", "Nhạc đang tắt (Nhấp để bật)");
}

function getAudioContext() {
  if (!state.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      state.audioContext = new AudioCtx();
    }
  }
  if (state.audioContext && state.audioContext.state === "suspended") {
    state.audioContext.resume();
  }
  return state.audioContext;
}

function playSoftBeep(freq = 440, duration = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playSuccessMelody() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      setTimeout(() => playSoftBeep(freq, 0.18), index * 100);
    });
  } catch (e) {}
}

function playErrorBuzz() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function playWaxSealCrackSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

function playHeartPopSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const baseFreq = 580 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

let ambientInterval = null;
function initWebAudioFallback() {
  if (ambientInterval) return;
  const arpeggio = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
  let noteIndex = 0;
  ambientInterval = setInterval(() => {
    if (!state.isAudioPlaying) return;
    playSoftBeep(arpeggio[noteIndex % arpeggio.length], 0.6);
    noteIndex++;
  }, 1200);
}

/* ==============================================================================
   15. HIỆU ỨNG CÁNH HOA BAY TRÊN CANVAS (AMBIENT SAKURA)
   ============================================================================== */
function initAmbientPetals() {
  const canvas = DOM.ambientCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = window.innerWidth < 600 ? 18 : 28;

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.8 + 0.5;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.03;
      this.color = Math.random() > 0.4 ? "rgba(244, 114, 182, 0.3)" : "rgba(251, 191, 36, 0.22)";
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.5 + this.speedX;
      this.angle += this.spinSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==============================================================================
   16. THIẾT LẬP CÁC SỰ KIỆN LẮNG NGHE (EVENT LISTENERS)
   ============================================================================== */
function setupEventListeners() {
  // Bàn phím số ảo
  DOM.numpad.addEventListener("click", e => {
    const key = e.target.closest(".num-key");
    if (!key) return;

    if (key.dataset.key) {
      handlePinInput(key.dataset.key);
    } else if (key.id === "backspace-btn") {
      handleBackspace();
    } else if (key.id === "hint-btn") {
      DOM.passcodeHint.style.display = "block";
      DOM.passcodeHint.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Bàn phím máy tính
  document.addEventListener("keydown", e => {
    if (!state.isUnlocked) {
      if (e.key >= "0" && e.key <= "9") {
        handlePinInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    }
  });

  // Mở con dấu sáp
  DOM.waxSeal.addEventListener("click", openEnvelope);

  // Gửi cái ôm
  DOM.sendHugBtn.addEventListener("click", handleSendHug);

  // Đọc nhanh bức thư
  DOM.skipTypingBtn.addEventListener("click", skipTypewriter);

  // Bật/tắt nhạc
  DOM.musicToggleBtn.addEventListener("click", toggleMusic);

  // Lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
  if (DOM.wishTagsGrid) {
    DOM.wishTagsGrid.addEventListener("click", e => {
      const tagBtn = e.target.closest(".wish-tag-btn");
      if (!tagBtn) return;

      tagBtn.classList.toggle("selected");
      playSoftBeep(650, 0.05);

      // Nếu bấm nút "Lựa chọn khác..."
      if (tagBtn.id === "wish-other-toggle") {
        if (tagBtn.classList.contains("selected")) {
          if (DOM.wishCustomContainer) {
            DOM.wishCustomContainer.style.display = "block";
            if (DOM.wishCustomInput) DOM.wishCustomInput.focus();
          }
        } else {
          if (DOM.wishCustomContainer) {
            DOM.wishCustomContainer.style.display = "none";
          }
        }
      }
    });
  }

  // Bộ đếm ký tự & Gửi phản hồi về Telegram
  if (DOM.replyTextInput) {
    DOM.replyTextInput.addEventListener("input", () => {
      const len = DOM.replyTextInput.value.length;
      DOM.replyCharCounter.textContent = `${len}/500`;
    });
  }

  if (DOM.sendReplyBtn) {
    DOM.sendReplyBtn.addEventListener("click", handleSendReply);
  }

  // Mở và đóng Hộp Thư Kỷ Niệm (Archive Modal)
  DOM.archiveToggleBtn.addEventListener("click", openArchiveModal);
  DOM.openArchiveFromFooterBtn.addEventListener("click", openArchiveModal);
  DOM.closeArchiveBtn.addEventListener("click", closeArchiveModal);
  DOM.archiveBackdrop.addEventListener("click", closeArchiveModal);

  // Nút đóng thư và đọc lại từ đầu
  DOM.rewatchBtn.addEventListener("click", () => {
    state.isUnlocked = false;
    state.isEnvelopeOpen = false;
    state.isLetterRevealed = false;
    state.isTypingDone = false;
    state.currentPin = "";
    updatePinDisplay();
    DOM.pinMessage.textContent = "";
    DOM.envelope.classList.remove("opening");
    DOM.tapSealHint.style.opacity = "1";
    DOM.skipTypingBtn.style.display = "inline-block";
    transitionScreen(DOM.letterScreen, DOM.lockScreen);
  });
}

/* ==============================================================================
   17. ĐĂNG KÝ PROGRESSIVE WEB APP (SERVICE WORKER & PWA INSTALL)
   ============================================================================== */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Chỉ đăng ký khi chạy qua http, https hoặc localhost (tránh lỗi file://)
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        navigator.serviceWorker
          .register("./sw.js")
          .then(registration => {
            console.log("✅ PWA Service Worker đã đăng ký thành công:", registration.scope);
          })
          .catch(error => {
            console.log("ℹ️ Đăng ký Service Worker:", error.message);
          });
      } else {
        console.log("ℹ️ Đang chạy ở chế độ file:// cục bộ, Service Worker sẽ hoạt động khi bạn đưa lên web hosting hoặc Live Server.");
      }
    });
  }
}
