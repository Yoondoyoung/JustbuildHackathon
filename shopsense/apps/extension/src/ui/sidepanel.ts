declare const chrome: any;

import type {
  AnalyzeResultMsg,
  ChatResponseMsg,
  ErrorMsg,
  Msg,
  StatusMsg,
} from "../shared/types";
import { renderAnalyze } from "./components/renderAnalyze";
import { renderChat } from "./components/renderChat";
import { renderAuth } from "./components/renderAuth";
import { checkAuth, onAuthStateChange, type AuthState } from "./components/auth";

const statusDot = document.querySelector("#status-dot") as HTMLSpanElement;
const statusText = document.querySelector("#status-text") as HTMLSpanElement;
const analyzeContainer = document.querySelector(
  "#analyze",
) as HTMLDivElement;
const chatContainer = document.querySelector("#chat") as HTMLDivElement;
const analyzeButton = document.querySelector(
  "#analyze-btn",
) as HTMLButtonElement;
const chatForm = document.querySelector("#chat-form") as HTMLFormElement;
const chatInput = document.querySelector("#chat-input") as HTMLTextAreaElement;
const chatSection = document.querySelector("#chat-section") as HTMLDivElement;
const authContainer = document.querySelector("#auth-container") as HTMLDivElement;
const mainContent = document.querySelector("#main-content") as HTMLDivElement;
const goodChoiceBtn = document.querySelector("#good-choice-btn") as HTMLButtonElement;
const tabOverview = document.querySelector("#tab-overview") as HTMLButtonElement;
const tabHighlights = document.querySelector("#tab-highlights") as HTMLButtonElement;
const tabSpecs = document.querySelector("#tab-specs") as HTMLButtonElement;
const tabContentOverview = document.querySelector("#tab-content-overview") as HTMLDivElement;
const tabContentHighlights = document.querySelector("#tab-content-highlights") as HTMLDivElement;
const tabContentSpecs = document.querySelector("#tab-content-specs") as HTMLDivElement;
const quickQuestionsEl = document.querySelector("#quick-questions") as HTMLDivElement;
const resultArea = document.querySelector("#result-area") as HTMLDivElement;

const renderAnalyzeOptions = () => ({
  overviewEl: tabContentOverview,
  highlightsEl: tabContentHighlights,
  specsEl: tabContentSpecs,
  quickQuestionsEl: quickQuestionsEl,
});

const setStatus = (text: string) => {
  statusText.textContent = text;
  const normalized = text.toLowerCase();
  statusDot.classList.remove("busy", "error", "complete");
  if (normalized.includes("fail") || normalized.includes("error")) {
    statusDot.classList.add("error");
  } else if (normalized === "analysis complete") {
    statusDot.classList.add("complete");
  } else if (
    normalized.includes("analyz") ||
    normalized.includes("send") ||
    normalized.includes("generat") ||
    normalized.includes("working") ||
    normalized.includes("fetch")
  ) {
    statusDot.classList.add("busy");
  }
};

const getActiveTabId = async (): Promise<number> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (typeof tabId !== "number") {
    throw new Error("No active tab found");
  }
  return tabId;
};

const sendMessage = async (msg: Msg) => {
  await chrome.runtime.sendMessage(msg);
};

const setChatEnabled = (enabled: boolean) => {
  chatSection.style.display = enabled ? "block" : "none";
  chatInput.disabled = !enabled;
  (chatForm.querySelector("button[type='submit']") as HTMLButtonElement | null)?.toggleAttribute(
    "disabled",
    !enabled,
  );
  if (!enabled) {
    chatInput.value = "";
  }
};

const showTab = (tab: "overview" | "highlights" | "specs") => {
  [tabOverview, tabHighlights, tabSpecs].forEach((btn) => btn.classList.remove("active"));
  [tabContentOverview, tabContentHighlights, tabContentSpecs].forEach((el) => {
    el.hidden = true;
  });
  if (tab === "overview") {
    tabOverview.classList.add("active");
    tabOverview.setAttribute("aria-selected", "true");
    tabHighlights.setAttribute("aria-selected", "false");
    tabSpecs.setAttribute("aria-selected", "false");
    tabContentOverview.hidden = false;
  } else if (tab === "highlights") {
    tabHighlights.classList.add("active");
    tabHighlights.setAttribute("aria-selected", "true");
    tabOverview.setAttribute("aria-selected", "false");
    tabSpecs.setAttribute("aria-selected", "false");
    tabContentHighlights.hidden = false;
  } else {
    tabSpecs.classList.add("active");
    tabSpecs.setAttribute("aria-selected", "true");
    tabOverview.setAttribute("aria-selected", "false");
    tabHighlights.setAttribute("aria-selected", "false");
    tabContentSpecs.hidden = false;
  }
};

// Default to disabled until auth/analyze flow enables it.
analyzeButton.disabled = true;
setChatEnabled(false);

const showMainContent = () => {
  authContainer.style.display = "none";
  mainContent.style.display = "block";
  analyzeButton.disabled = false;
  // Chat should be available only after analyzing the page.
  setChatEnabled(false);
};

const showAuth = () => {
  authContainer.style.display = "flex";
  mainContent.style.display = "none";
  analyzeButton.disabled = true;
  setChatEnabled(false);
  // Clear any existing content
  authContainer.innerHTML = "";
  renderAuth(authContainer, showMainContent);
};

const handleSuggestedQuestion = async (question: string) => {
  try {
    const tabId = await getActiveTabId();
    await sendMessage({ type: "CHAT_SEND", tabId, question });
  } catch {
    setStatus("Failed to send question.");
  }
};

const initMainContent = async () => {
  try {
    const tabId = await getActiveTabId();
    const response = await chrome.runtime.sendMessage({ type: "PANEL_INIT", tabId });
    if (response?.result) {
      if (resultArea) resultArea.style.display = "block";
      renderAnalyze(analyzeContainer, response.result, handleSuggestedQuestion, renderAnalyzeOptions());
      setChatEnabled(true);
      setStatus("Analysis Complete");
      goodChoiceBtn.style.display = "inline-flex";
      showTab("overview");
    } else {
      if (resultArea) resultArea.style.display = "none";
      setChatEnabled(false);
      goodChoiceBtn.style.display = "none";
      setStatus("Idle");
    }
    if (Array.isArray(response?.history)) {
      response.history.forEach((message: { role: "user" | "assistant"; content: string }) => {
        renderChat(chatContainer, message);
      });
    }
  } catch (error) {
    setStatus("Unable to initialize panel.");
  }
};

const init = async () => {
  try {
    const authState = await checkAuth();
    
    if (authState.isAuthenticated) {
      showMainContent();
      await initMainContent();
    } else {
      showAuth();
    }

    // Listen for auth state changes
    onAuthStateChange((state: AuthState) => {
      if (state.isAuthenticated) {
        showMainContent();
        initMainContent();
      } else {
        showAuth();
      }
    });
  } catch (error) {
    console.error("Auth check failed:", error);
    // If auth check fails, show auth screen anyway
    showAuth();
  }
};

analyzeButton.addEventListener("click", async () => {
  try {
    setStatus("Analyzing...");
    const tabId = await getActiveTabId();
    await sendMessage({ type: "ANALYZE_CLICK", tabId });
  } catch (error) {
    setStatus("Analyze failed.");
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  try {
    const tabId = await getActiveTabId();
    renderChat(chatContainer, { role: "user", content: question });
    chatInput.value = "";
    await sendMessage({ type: "CHAT_SEND", tabId, question });
  } catch (error) {
    setStatus("Chat failed.");
  }
});

chatInput.addEventListener("keydown", (event) => {
  if (event.isComposing) {
    return;
  }
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: AnalyzeResultMsg | ChatResponseMsg | StatusMsg | ErrorMsg,
    _sender,
    sendResponse,
  ) => {
    if (message.type === "STATUS") {
      setStatus(message.message);
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "ERROR") {
      setStatus(message.message);
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "ANALYZE_RESULT") {
      if (resultArea) resultArea.style.display = "block";
      renderAnalyze(analyzeContainer, message.result, handleSuggestedQuestion, renderAnalyzeOptions());
      setChatEnabled(true);
      setStatus("Analysis Complete");
      goodChoiceBtn.style.display = "inline-flex";
      showTab("overview");
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "CHAT_RESPONSE") {
      renderChat(chatContainer, message.message);
      setStatus("Chat ready");
      sendResponse({ ok: true });
      return true;
    }

    return false;
  },
);

tabOverview.addEventListener("click", () => showTab("overview"));
tabHighlights.addEventListener("click", () => showTab("highlights"));
tabSpecs.addEventListener("click", () => showTab("specs"));

const closeBtn = document.querySelector("#close-btn") as HTMLButtonElement;
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    window.close();
  });
}

init();
