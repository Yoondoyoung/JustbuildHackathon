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

const setStatus = (text: string) => {
  statusText.textContent = text;
  const normalized = text.toLowerCase();
  statusDot.classList.remove("busy", "error");
  if (normalized.includes("fail") || normalized.includes("error")) {
    statusDot.classList.add("error");
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
      renderAnalyze(analyzeContainer, response.result, handleSuggestedQuestion);
      setChatEnabled(true);
    } else {
      setChatEnabled(false);
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
      renderAnalyze(analyzeContainer, message.result, handleSuggestedQuestion);
      setStatus("Analyze completed");
      setChatEnabled(true);
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

init();
