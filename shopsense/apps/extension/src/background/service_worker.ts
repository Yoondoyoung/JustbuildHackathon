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
} from "../shared/types";
import { postAnalyze, postChat } from "./apiClient";

const SIDE_PANEL_PATH = "src/ui/sidepanel.html";

const isSidePanelAvailable = () =>
  typeof chrome.sidePanel?.setOptions === "function" &&
  typeof chrome.sidePanel?.open === "function";

chrome.runtime.onInstalled.addListener(() => {
  if (!isSidePanelAvailable()) return;
  chrome.sidePanel.setOptions({ path: SIDE_PANEL_PATH, enabled: true });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (typeof tab.id !== "number") return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"],
    });
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
  }
});

const analyzeCache = new Map<number, AnalyzeResult>();
const extractedCache = new Map<number, Extracted>();
const chatCache = new Map<number, ChatMessage[]>();

const sendStatus = (tabId: number, message: string) => {
  const msg: StatusMsg = { type: "STATUS", tabId, message };
  chrome.runtime.sendMessage(msg);
};

const sendError = (tabId: number, message: string) => {
  const msg: ErrorMsg = { type: "ERROR", tabId, message };
  chrome.runtime.sendMessage(msg);
};

const sendAnalyzeResult = (tabId: number, result: AnalyzeResult) => {
  const msg: AnalyzeResultMsg = { type: "ANALYZE_RESULT", tabId, result };
  chrome.runtime.sendMessage(msg);
};

const sendChatResponse = (tabId: number, message: ChatMessage) => {
  const msg: ChatResponseMsg = { type: "CHAT_RESPONSE", tabId, message };
  chrome.runtime.sendMessage(msg);
};

const fallbackAnalyze = (extracted: Extracted): AnalyzeResult => {
  return {
    title: extracted.title,
    summary: extracted.title
      ? `Analyzed ${extracted.title}`
      : "Basic analyze fallback used.",
    specs: extracted.key_specs,
    price: extracted.price,
    rating: extracted.rating,
    review_count: extracted.review_count,
  };
};

const requestExtract = async (tabId: number): Promise<Extracted> => {
  const response = await chrome.tabs.sendMessage(tabId, {
    type: "EXTRACT_REQUEST",
  } satisfies ExtractRequest);
  return response as Extracted;
};

chrome.runtime.onMessage.addListener(
  (message: Msg, sender, sendResponse) => {
    const resolveTabId = () =>
      ("tabId" in message ? message.tabId : undefined) ?? sender.tab?.id;

    if (message.type === "GET_TAB_ID") {
      sendResponse({ tabId: sender.tab?.id ?? null });
      return true;
    }

    if (message.type === "ANALYZE_CLICK") {
      const tabId = resolveTabId();
      if (typeof tabId !== "number") {
        sendResponse({ ok: false, error: "No tab id available" });
        return true;
      }

      (async () => {
        try {
          sendStatus(tabId, "Extracting page data...");
          const extracted = await requestExtract(tabId);
          extractedCache.set(tabId, extracted);

          sendStatus(tabId, "Calling analyze API...");
          let result: AnalyzeResult;
          try {
            result = await postAnalyze(extracted);
          } catch (error) {
            result = fallbackAnalyze(extracted);
            sendStatus(tabId, "Analyze API failed, using fallback.");
          }

          analyzeCache.set(tabId, result);
          sendAnalyzeResult(tabId, result);
          sendResponse({ ok: true });
        } catch (error) {
          const messageText =
            error instanceof Error ? error.message : "Analyze failed";
          sendError(tabId, messageText);
          sendResponse({ ok: false, error: messageText });
        }
      })();

      return true;
    }

    if (message.type === "CHAT_SEND") {
      const tabId = resolveTabId();
      if (typeof tabId !== "number") {
        sendResponse({ ok: false, error: "No tab id available" });
        return true;
      }

      (async () => {
        try {
          const cachedAnalyze = analyzeCache.get(tabId);
          const cachedExtracted = extractedCache.get(tabId);

          sendStatus(tabId, "Sending chat request...");
          let responseMessage: ChatMessage;
          try {
            const response = await postChat({
              question: message.question,
              analyze: cachedAnalyze,
              extracted: cachedExtracted,
            });
            responseMessage = response.message;
          } catch (error) {
            responseMessage = {
              role: "assistant",
              content: "Chat API failed. Please try again.",
            };
            sendStatus(tabId, "Chat API failed, using fallback.");
          }

          const history = chatCache.get(tabId) ?? [];
          history.push({ role: "user", content: message.question });
          history.push(responseMessage);
          chatCache.set(tabId, history);

          sendChatResponse(tabId, responseMessage);
          sendResponse({ ok: true });
        } catch (error) {
          const messageText =
            error instanceof Error ? error.message : "Chat failed";
          sendError(tabId, messageText);
          sendResponse({ ok: false, error: messageText });
        }
      })();

      return true;
    }

    if (message.type === "PANEL_INIT") {
      const result = analyzeCache.get(message.tabId);
      const history = chatCache.get(message.tabId) ?? [];
      sendResponse({ ok: true, result, history });
      return true;
    }

    return false;
  },
);
