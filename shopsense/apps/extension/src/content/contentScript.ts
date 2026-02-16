declare const chrome: any;

import type {
  AnalyzeResult,
  AnalyzeResultMsg,
  ChatMessage,
  ChatResponseMsg,
  ErrorMsg,
  ExtractRequest,
  Extracted,
  Msg,
  StatusMsg,
  UserPreferences,
} from "../shared/types";
import { extractPage } from "./extractor";

/** Inline formatter so content script has no chunk dependency (Chrome doesn't load ES module chunks for content scripts). */
function formatChatContent(content: string): string {
  if (!content || typeof content !== "string") return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const parts: string[] = [];
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(content)) !== null) {
    parts.push(
      escape(content.slice(last, m.index))
        .replace(/\n/g, "<br>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    );
    parts.push(
      `<a href="${escape(m[2])}" target="_blank" rel="noreferrer noopener">${escape(m[1])}</a>`
    );
    last = linkRe.lastIndex;
  }
  parts.push(
    escape(content.slice(last))
      .replace(/\n/g, "<br>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  );
  return parts.join("");
}

const SIDEBAR_ID = "shopsense-sidebar";

let currentTabId: number | null = null;
let statusDot: HTMLSpanElement | null = null;
let statusText: HTMLSpanElement | null = null;
let analyzeContainer: HTMLDivElement | null = null;
let chatContainer: HTMLDivElement | null = null;
let chatInput: HTMLTextAreaElement | null = null;
let sidebarHost: HTMLDivElement | null = null;

const getTabId = async (): Promise<number | null> => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_TAB_ID",
    } satisfies Msg);
    if (typeof response?.tabId === "number") {
      return response.tabId;
    }
  } catch (error) {
    // ignore
  }
  return null;
};

const setStatus = (text: string) => {
  if (!statusText || !statusDot) return;
  statusText.textContent = text;
  statusDot.classList.remove("busy", "error");
  const normalized = text.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    statusDot.classList.add("error");
  } else if (normalized.includes("analyz") || normalized.includes("send")) {
    statusDot.classList.add("busy");
  }
};

const renderAnalyze = (container: HTMLElement, result: AnalyzeResult) => {
  container.innerHTML = "";

  const summary = document.createElement("p");
  summary.textContent = result.summary ?? "No summary available.";
  container.appendChild(summary);

  if (result.price) {
    const price = document.createElement("div");
    price.className = "meta-row";
    price.textContent = `Price: ${result.price.value} ${result.price.currency}`;
    container.appendChild(price);
  }

  if (result.rating !== undefined) {
    const rating = document.createElement("div");
    rating.className = "meta-row";
    rating.textContent = `Rating: ${result.rating}`;
    container.appendChild(rating);
  }

  if (result.review_count !== undefined) {
    const reviews = document.createElement("div");
    reviews.className = "meta-row";
    reviews.textContent = `Reviews: ${result.review_count}`;
    container.appendChild(reviews);
  }

  if (result.key_points?.length) {
    const list = document.createElement("ul");
    result.key_points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  if (result.specs && Object.keys(result.specs).length > 0) {
    const specs = document.createElement("div");
    specs.className = "specs";

    Object.entries(result.specs).forEach(([key, value]) => {
      const row = document.createElement("div");
      row.className = "spec-row";
      row.textContent = `${key}: ${value}`;
      specs.appendChild(row);
    });

    container.appendChild(specs);
  }

  if (result.citations?.length) {
    const citations = document.createElement("div");
    citations.className = "citations";

    result.citations.forEach((citation) => {
      const link = document.createElement("a");
      link.href = citation.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = citation.title ?? citation.url;
      citations.appendChild(link);
    });

    container.appendChild(citations);
  }

  if (result.suggested_questions?.length) {
    const section = document.createElement("div");
    section.className = "suggested-questions";

    result.suggested_questions.forEach((question) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggested-question-btn";
      btn.textContent = question;
      btn.style.display = "block";
      btn.style.width = "100%";
      btn.style.textAlign = "left";
      btn.style.padding = "0.5rem 0.75rem";
      btn.style.marginBottom = "0.35rem";
      btn.style.cursor = "pointer";
      btn.style.border = "1px solid #e0e0e0";
      btn.style.borderRadius = "4px";
      btn.style.background = "#f5f5f5";
      btn.style.fontSize = "0.9rem";
      btn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "CHAT_SEND", question });
      });
      section.appendChild(btn);
    });

    container.appendChild(section);
  }
};

const renderChat = (container: HTMLElement, message: ChatMessage) => {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${message.role}`;

  const text = document.createElement("div");
  text.className = "chat-text";
  text.innerHTML = formatChatContent(message.content);

  wrapper.appendChild(text);

  if (message.citations?.length) {
    const citations = document.createElement("div");
    citations.className = "chat-citations";

    message.citations.forEach((citation) => {
      const link = document.createElement("a");
      link.href = citation.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = citation.title ?? citation.url;
      citations.appendChild(link);
    });

    wrapper.appendChild(citations);
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
};

const ensureSidebar = () => {
  if (sidebarHost) return;
  const existing = document.getElementById(SIDEBAR_ID) as HTMLDivElement | null;
  if (existing) {
    sidebarHost = existing;
    return;
  }

  const host = document.createElement("div");
  host.id = SIDEBAR_ID;
  host.style.position = "fixed";
  host.style.top = "16px";
  host.style.right = "16px";
  host.style.left = "auto";
  host.style.bottom = "auto";
  host.style.margin = "0";
  host.style.transform = "none";
  host.style.width = "340px";
  host.style.height = "calc(100vh - 32px)";
  host.style.zIndex = "2147483647";
  host.style.display = "none";

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      .sidebar { height: 100%; background: #fff; border-radius: 16px; border: 1px solid #f0f0f0;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .header { padding: 16px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
      .title { font-size: 18px; font-weight: 700; color: #111827; }
      .status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
      .dot.busy { background: #f59e0b; }
      .dot.error { background: #ef4444; }
      .action { padding: 14px 16px; border-bottom: 1px solid #eee; }
      .btn { border: none; border-radius: 10px; padding: 10px 12px; cursor: pointer; font-weight: 600; font-size: 13px; }
      .btn-secondary { width: 100%; background: #f3f4f6; color: #111827; }
      .btn-primary { background: #3b82f6; color: #fff; }
      .content { flex: 1; padding: 16px; background: #fafafa; overflow-y: auto; }
      .panel { background: #fff; padding: 12px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .panel h2 { margin: 0 0 8px 0; font-size: 14px; }
      .meta-row { font-size: 13px; margin-top: 4px; color: #4b5563; }
      .specs { margin-top: 8px; font-size: 12px; }
      .spec-row { padding: 4px 0; border-bottom: 1px solid #eee; }
      .chat-log { font-size: 13px; }
      .chat-text { line-height: 1.5; }
      .chat-text a { color: #2563eb; text-decoration: none; }
      .chat-text a:hover { text-decoration: underline; }
      .chat-message { padding: 8px; border-radius: 10px; margin-bottom: 8px; background: #f3f4f6; }
      .chat-message.user { background: #e0ecff; }
      .chat-citations a { display: block; font-size: 11px; color: #3b82f6; }
      .chat-input { padding: 12px 16px 16px; border-top: 1px solid #eee; background: #fff; position: relative; }
      .chat-input textarea { width: 100%; padding: 12px 48px 12px 12px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f9fafb; resize: none; outline: none; font-size: 13px; }
      .chat-input button { position: absolute; right: 22px; bottom: 22px; }
      .auth-wrapper {
        flex: 1;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }
      .auth-container { width: 100%; max-width: 320px; }
      .auth-title { text-align: center; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; color: #111827; }
      .auth-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
      .auth-tab { flex: 1; padding: 12px; border: none; background: transparent; color: #6b7280; font-size: 14px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
      .auth-tab:hover { color: #111827; }
      .auth-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
      .auth-form { display: flex; flex-direction: column; gap: 16px; }
      .auth-input { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
      .auth-input:focus { border-color: #3b82f6; }
      .auth-error { padding: 10px; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 13px; text-align: center; display: none; }
      .auth-submit { width: 100%; padding: 12px; margin-top: 8px; }
      .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .main-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
      .settings-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
      .settings-btn:hover { background: #f3f4f6; color: #111827; }
      .settings-icon { width: 18px; height: 18px; }
      .minimize-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
      .minimize-btn:hover { background: #f3f4f6; color: #111827; }
      .minimize-icon { width: 18px; height: 18px; }
      .sidebar.minimized { width: 80px !important; height: 80px !important; border-radius: 50% !important; overflow: visible !important; }
      .sidebar.minimized .header { padding: 0; border: none; justify-content: center; align-items: center; height: 100%; overflow: visible; }
      .sidebar.minimized .title { display: none; }
      .sidebar.minimized .status { display: none; }
      .sidebar.minimized .settings-btn { display: none; }
      .sidebar.minimized .minimize-btn { display: none; }
      .sidebar.minimized #ss-auth-container { display: none !important; }
      .sidebar.minimized #ss-main-content { display: none !important; }
      .minimized-icon { display: none; }
      .sidebar.minimized .minimized-icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: relative; cursor: pointer; overflow: visible; }
      .icon-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(180deg, #a78bfa 0%, #f9a8d4 100%); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: visible; }
      .icon-circle::before { content: ''; position: absolute; top: 8px; left: 8px; width: 20px; height: 20px; background: rgba(255,255,255,0.3); border-radius: 50%; }
      .shopping-bag-icon { width: 28px; height: 28px; stroke: white; stroke-width: 2; fill: none; position: relative; z-index: 1; }
      .question-mark { fill: white; }
      .ps-text { font-size: 7px; font-weight: 400; color: #4b5563; font-family: Georgia, serif; margin-top: 20px; position: relative; z-index: 1; line-height: 1; }
      .close-btn-mini { position: absolute; top: -10px; right: -10px; width: 26px; height: 26px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 100; }
      .close-btn-mini:hover { background: #f3f4f6; }
      .close-x { width: 14px; height: 14px; stroke: #111827; stroke-width: 2.5; }
      .more-options-mini { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; }
      .more-options-mini .dot { width: 4px; height: 4px; background: rgba(255,255,255,0.8); border-radius: 50%; }
      .more-options-mini:hover .dot { background: white; }
    </style>
    <div class="sidebar" id="ss-sidebar">
      <div class="header">
        <div class="title">ShopSense</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="status"><span class="dot" id="ss-status-dot"></span><span id="ss-status-text">Idle</span></div>
          <button class="settings-btn" id="ss-settings-btn" title="Settings">
            <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="minimize-btn" id="ss-minimize-btn" title="Minimize">
            <svg class="minimize-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="minimized-icon" id="ss-minimized-icon">
        <div class="icon-circle">
          <svg class="shopping-bag-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <svg viewBox="0 0 24 24" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px;">
            <text x="12" y="16" text-anchor="middle" class="question-mark" fill="white" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">?</text>
          </svg>
          <div class="ps-text">
            P<span style="position: relative;">S<svg class="checkmark" viewBox="0 0 8 8" style="position: absolute; right: -5px; bottom: -1px; width: 6px; height: 6px;">
              <path d="M1 4l2 2 4-4" stroke="#4b5563" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></span>
          </div>
          <div class="close-btn-mini" id="ss-close-mini">
            <svg class="close-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <div class="more-options-mini" id="ss-more-options-mini">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
      <div id="ss-auth-container" class="auth-wrapper" style="display: none;"></div>
      <div id="ss-main-content" class="main-content">
        <div class="action">
          <button id="ss-analyze-btn" class="btn btn-secondary" type="button">Analyze Page</button>
        </div>
        <div class="content">
          <section id="ss-analyze" class="panel"></section>
          <div id="ss-chat-section" style="display: none;">
            <section class="panel">
              <h2>Chat</h2>
              <div id="ss-chat" class="chat-log"></div>
            </section>

            <form id="ss-chat-form" class="chat-input">
              <textarea id="ss-chat-input" rows="2" placeholder="Ask about this product..."></textarea>
              <button class="btn btn-primary" type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.documentElement.appendChild(host);
  sidebarHost = host;

  statusDot = shadow.querySelector("#ss-status-dot") as HTMLSpanElement;
  statusText = shadow.querySelector("#ss-status-text") as HTMLSpanElement;
  analyzeContainer = shadow.querySelector("#ss-analyze") as HTMLDivElement;
  chatContainer = shadow.querySelector("#ss-chat") as HTMLDivElement;
  chatInput = shadow.querySelector("#ss-chat-input") as HTMLTextAreaElement;
  const chatSection = shadow.querySelector("#ss-chat-section") as HTMLDivElement;
  const authContainer = shadow.querySelector("#ss-auth-container") as HTMLDivElement;
  const mainContent = shadow.querySelector("#ss-main-content") as HTMLDivElement;

  const analyzeButton = shadow.querySelector("#ss-analyze-btn") as HTMLButtonElement;
  const chatForm = shadow.querySelector("#ss-chat-form") as HTMLFormElement;
  const settingsButton = shadow.querySelector("#ss-settings-btn") as HTMLButtonElement;
  const minimizeButton = shadow.querySelector("#ss-minimize-btn") as HTMLButtonElement;
  const sidebar = shadow.querySelector("#ss-sidebar") as HTMLDivElement;

  const setChatEnabled = (enabled: boolean) => {
    chatSection.style.display = enabled ? "block" : "none";
    if (chatInput) chatInput.disabled = !enabled;
    (chatForm.querySelector("button[type='submit']") as HTMLButtonElement | null)?.toggleAttribute(
      "disabled",
      !enabled,
    );
    if (!enabled && chatInput) chatInput.value = "";
  };

  // Initialize auth UI
  const initAuth = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "CHECK_AUTH" } satisfies Msg);
      if (response?.isAuthenticated) {
        const prefsResponse = await chrome.runtime.sendMessage({ type: "CHECK_PREFERENCES" } satisfies Msg);
        if (prefsResponse?.hasPreferences) {
          showMainContent();
        } else {
          showPreferences();
        }
      } else {
        showAuth();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      showAuth();
    }
  };

  const showAuth = () => {
    authContainer.style.display = "flex";
    mainContent.style.display = "none";
    authContainer.innerHTML = `
      <div class="auth-container">
        <h2 class="auth-title">ShopSense</h2>
        <div class="auth-tabs">
          <button class="auth-tab active" data-mode="login">Sign In</button>
          <button class="auth-tab" data-mode="signup">Sign Up</button>
        </div>
        <form class="auth-form" id="ss-auth-form">
          <input type="email" class="auth-input" placeholder="Email" required id="ss-auth-email">
          <input type="password" class="auth-input" placeholder="Password" required id="ss-auth-password">
          <div class="auth-error" id="ss-auth-error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary auth-submit" id="ss-auth-submit">Sign In</button>
        </form>
      </div>
    `;

    let currentMode: "login" | "signup" = "login";
    const loginTab = authContainer.querySelector('[data-mode="login"]') as HTMLButtonElement;
    const signupTab = authContainer.querySelector('[data-mode="signup"]') as HTMLButtonElement;
    const form = authContainer.querySelector("#ss-auth-form") as HTMLFormElement;
    const emailInput = authContainer.querySelector("#ss-auth-email") as HTMLInputElement;
    const passwordInput = authContainer.querySelector("#ss-auth-password") as HTMLInputElement;
    const errorMessage = authContainer.querySelector("#ss-auth-error") as HTMLDivElement;
    const submitButton = authContainer.querySelector("#ss-auth-submit") as HTMLButtonElement;

    const switchMode = (mode: "login" | "signup") => {
      currentMode = mode;
      loginTab.classList.toggle("active", mode === "login");
      signupTab.classList.toggle("active", mode === "signup");
      submitButton.textContent = mode === "login" ? "Sign In" : "Sign Up";
      errorMessage.style.display = "none";
    };

    loginTab.addEventListener("click", () => switchMode("login"));
    signupTab.addEventListener("click", () => switchMode("signup"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMessage.style.display = "none";

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorMessage.textContent = "Please enter email and password.";
        errorMessage.style.display = "block";
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = currentMode === "login" ? "Signing in..." : "Signing up...";

      try {
        const response = await chrome.runtime.sendMessage({
          type: currentMode === "login" ? "SIGN_IN" : "SIGN_UP",
          email,
          password,
        } satisfies Msg);
        
        if (response?.error) {
          errorMessage.textContent = response.error;
          errorMessage.style.display = "block";
        } else {
          // Check if user has completed preferences
          const prefsResponse = await chrome.runtime.sendMessage({ type: "CHECK_PREFERENCES" } satisfies Msg);
          if (prefsResponse?.hasPreferences) {
            showMainContent();
          } else {
            showPreferences();
          }
        }
      } catch (error: any) {
        errorMessage.textContent = error.message || "An error occurred.";
        errorMessage.style.display = "block";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = currentMode === "login" ? "Sign In" : "Sign Up";
      }
    });
  };

  const showPreferences = async () => {
    authContainer.style.display = "flex";
    mainContent.style.display = "none";
    
    // Load existing preferences
    let existingPrefs: UserPreferences | null = null;
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_PREFERENCES" } satisfies Msg);
      existingPrefs = response?.preferences || null;
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }

    authContainer.innerHTML = `
      <div class="auth-container" style="max-width: 400px;">
        <h2 class="auth-title">Shopping Preferences</h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 24px; font-size: 14px;">
          Help us personalize your shopping experience
        </p>
        <form class="auth-form" id="ss-preferences-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Price Sensitivity <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-price">
              <option value="">No preference</option>
              <option value="budget">Budget-conscious</option>
              <option value="value">Value-focused</option>
              <option value="premium">Premium</option>
              <option value="flexible">Price-flexible</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Quality Preference <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-quality">
              <option value="">No preference</option>
              <option value="high">High Quality</option>
              <option value="balanced">Balanced</option>
              <option value="basic">Basic</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Brand Preference <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-brand">
              <option value="">No preference</option>
              <option value="loyal">Brand-loyal</option>
              <option value="explorer">Brand-explorer</option>
              <option value="none">No preference</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Sustainability <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-sustainability">
              <option value="">No preference</option>
              <option value="eco">Eco-friendly</option>
              <option value="low">Not a priority</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Review Dependency <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-reviews">
              <option value="">No preference</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Innovation Adoption <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-innovation">
              <option value="">No preference</option>
              <option value="early">Early adopter</option>
              <option value="wait">Wait for reviews</option>
              <option value="conservative">Conservative</option>
            </select>
          </div>
          <div class="auth-error" id="ss-pref-error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary auth-submit" id="ss-pref-submit">Save Preferences</button>
        </form>
      </div>
    `;

    const form = authContainer.querySelector("#ss-preferences-form") as HTMLFormElement;
    const errorMessage = authContainer.querySelector("#ss-pref-error") as HTMLDivElement;
    const submitButton = authContainer.querySelector("#ss-pref-submit") as HTMLButtonElement;

    // Set existing values if available
    if (existingPrefs) {
      const priceSelect = authContainer.querySelector("#ss-pref-price") as HTMLSelectElement;
      const qualitySelect = authContainer.querySelector("#ss-pref-quality") as HTMLSelectElement;
      const brandSelect = authContainer.querySelector("#ss-pref-brand") as HTMLSelectElement;
      const sustainabilitySelect = authContainer.querySelector("#ss-pref-sustainability") as HTMLSelectElement;
      const reviewsSelect = authContainer.querySelector("#ss-pref-reviews") as HTMLSelectElement;
      const innovationSelect = authContainer.querySelector("#ss-pref-innovation") as HTMLSelectElement;

      if (priceSelect && existingPrefs.price) priceSelect.value = existingPrefs.price;
      if (qualitySelect && existingPrefs.quality) qualitySelect.value = existingPrefs.quality;
      if (brandSelect && existingPrefs.brand) brandSelect.value = existingPrefs.brand;
      if (sustainabilitySelect && existingPrefs.sustainability) sustainabilitySelect.value = existingPrefs.sustainability;
      if (reviewsSelect && existingPrefs.reviews) reviewsSelect.value = existingPrefs.reviews;
      if (innovationSelect && existingPrefs.innovation) innovationSelect.value = existingPrefs.innovation;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMessage.style.display = "none";

      const preferences: UserPreferences = {
        price: ((authContainer.querySelector("#ss-pref-price") as HTMLSelectElement).value || null) as UserPreferences["price"],
        quality: ((authContainer.querySelector("#ss-pref-quality") as HTMLSelectElement).value || null) as UserPreferences["quality"],
        brand: ((authContainer.querySelector("#ss-pref-brand") as HTMLSelectElement).value || null) as UserPreferences["brand"],
        sustainability: ((authContainer.querySelector("#ss-pref-sustainability") as HTMLSelectElement).value || null) as UserPreferences["sustainability"],
        reviews: ((authContainer.querySelector("#ss-pref-reviews") as HTMLSelectElement).value || null) as UserPreferences["reviews"],
        innovation: ((authContainer.querySelector("#ss-pref-innovation") as HTMLSelectElement).value || null) as UserPreferences["innovation"],
      };

      submitButton.disabled = true;
      submitButton.textContent = "Saving...";

      try {
        const response = await chrome.runtime.sendMessage({
          type: "SAVE_PREFERENCES",
          preferences,
        } satisfies Msg);
        
        if (response?.error) {
          errorMessage.textContent = response.error;
          errorMessage.style.display = "block";
        } else {
          showMainContent();
        }
      } catch (error: any) {
        errorMessage.textContent = error.message || "An error occurred.";
        errorMessage.style.display = "block";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Save Preferences";
      }
    });
  };

  const showMainContent = () => {
    authContainer.style.display = "none";
    mainContent.style.display = "flex";
    // Chat should be available only after analyzing the page.
    setChatEnabled(false);
  };

  analyzeButton.addEventListener("click", async () => {
    setStatus("Analyzing...");
    await chrome.runtime.sendMessage({ type: "ANALYZE_CLICK" } satisfies Msg);
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = chatInput?.value.trim() ?? "";
    if (!question || !chatContainer) return;

    renderChat(chatContainer, { role: "user", content: question });
    if (chatInput) chatInput.value = "";
    await chrome.runtime.sendMessage({
      type: "CHAT_SEND",
      question,
    } satisfies Msg);
  });

  chatInput?.addEventListener("keydown", (event) => {
    if (event.isComposing) {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });

  settingsButton.addEventListener("click", () => {
    showPreferences();
  });

  let isMinimized = false;
  const minimizedIcon = shadow.querySelector("#ss-minimized-icon") as HTMLDivElement;
  const closeBtnMini = shadow.querySelector("#ss-close-mini") as HTMLDivElement;
  const moreOptionsMini = shadow.querySelector("#ss-more-options-mini") as HTMLDivElement;

  const toggleMinimize = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      sidebar.classList.add("minimized");
      minimizeButton.title = "Expand";
      // Ensure it's positioned on the right edge and maintain position
      if (sidebarHost) {
        const currentTop = sidebarHost.style.top || window.getComputedStyle(sidebarHost).top || "16px";
        sidebarHost.style.position = "fixed";
        sidebarHost.style.top = currentTop;
        sidebarHost.style.right = "16px";
        sidebarHost.style.left = "auto";
        sidebarHost.style.bottom = "auto";
        sidebarHost.style.width = "80px";
        sidebarHost.style.height = "80px";
        sidebarHost.style.margin = "0";
        sidebarHost.style.transform = "none";
      }
    } else {
      sidebar.classList.remove("minimized");
      minimizeButton.title = "Minimize";
      // Restore original size and position
      if (sidebarHost) {
        const currentTop = sidebarHost.style.top || window.getComputedStyle(sidebarHost).top || "16px";
        sidebarHost.style.position = "fixed";
        sidebarHost.style.top = currentTop;
        sidebarHost.style.right = "16px";
        sidebarHost.style.left = "auto";
        sidebarHost.style.bottom = "auto";
        sidebarHost.style.width = "340px";
        sidebarHost.style.height = "calc(100vh - 32px)";
        sidebarHost.style.margin = "0";
        sidebarHost.style.transform = "none";
      }
    }
  };

  minimizeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMinimize();
  });

  minimizedIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isMinimized) {
      toggleMinimize();
    }
  });

  closeBtnMini.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebarHost) {
      sidebarHost.style.display = "none";
    }
  });

  moreOptionsMini.addEventListener("click", (e) => {
    e.stopPropagation();
    // Could show a menu here in the future
    showPreferences();
  });

  // Initialize auth on sidebar creation
  initAuth();
};

const showSidebar = () => {
  ensureSidebar();
  if (sidebarHost) sidebarHost.style.display = "block";
};

const toggleSidebar = () => {
  ensureSidebar();
  if (!sidebarHost) return;
  const isHidden = sidebarHost.style.display === "none";
  sidebarHost.style.display = isHidden ? "block" : "none";
};

const extract = (): Extracted => {
  const result = extractPage();
  console.log("[ShopSense] extracted", result);
  return result;
};

chrome.runtime.onMessage.addListener(
  (
    message: ExtractRequest | AnalyzeResultMsg | ChatResponseMsg | StatusMsg | ErrorMsg | { type: "TOGGLE_SIDEBAR" },
    _sender,
    sendResponse,
  ) => {
    if (message.type === "EXTRACT_REQUEST") {
      sendResponse(extract());
      return true;
    }

    const msgTabId = "tabId" in message ? message.tabId : undefined;
    if (msgTabId != null && currentTabId != null && msgTabId !== currentTabId) {
      return false;
    }

    if (message.type === "TOGGLE_SIDEBAR") {
      toggleSidebar();
      return true;
    }

    showSidebar();

    if (message.type === "STATUS") {
      setStatus(message.message);
      return true;
    }

    if (message.type === "ERROR") {
      setStatus(message.message);
      return true;
    }

    if (message.type === "ANALYZE_RESULT" && analyzeContainer) {
      renderAnalyze(analyzeContainer, message.result);
      setStatus("Analyze completed");
      setChatEnabled(true);
      return true;
    }

    if (message.type === "CHAT_RESPONSE" && chatContainer) {
      renderChat(chatContainer, message.message);
      setStatus("Chat ready");
      return true;
    }

    return false;
  },
);

const init = async () => {
  currentTabId = await getTabId();
};

init();
