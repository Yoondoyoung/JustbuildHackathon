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

const statusEl = document.querySelector("#status") as HTMLDivElement;
const analyzeContainer = document.querySelector(
  "#analyze",
) as HTMLDivElement;
const chatContainer = document.querySelector("#chat") as HTMLDivElement;
const analyzeButton = document.querySelector(
  "#analyze-btn",
) as HTMLButtonElement;
const chatForm = document.querySelector("#chat-form") as HTMLFormElement;
const chatInput = document.querySelector("#chat-input") as HTMLInputElement;

const setStatus = (text: string) => {
  statusEl.textContent = text;
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

const init = async () => {
  try {
    const tabId = await getActiveTabId();
    const response = await chrome.runtime.sendMessage({ type: "PANEL_INIT", tabId });
    if (response?.result) {
      renderAnalyze(analyzeContainer, response.result);
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
      renderAnalyze(analyzeContainer, message.result);
      setStatus("Analyze completed");
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
