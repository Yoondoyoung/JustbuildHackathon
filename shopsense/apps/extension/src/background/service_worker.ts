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
import { supabase } from "../shared/supabase";

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
    // Content script is already declared in manifest; ignore failures
    // for restricted pages (chrome://, PDFs, etc.).
  }
});

const analyzeCache = new Map<number, AnalyzeResult>();
const extractedCache = new Map<number, Extracted>();
const chatCache = new Map<number, ChatMessage[]>();

type SavedCredentials = {
  email: string;
  password: string;
};

const getSavedCredentials = async (): Promise<SavedCredentials | null> => {
  try {
    const result = await chrome.storage.local.get("authCredentials");
    const creds = result?.authCredentials;
    if (
      creds &&
      typeof creds.email === "string" &&
      typeof creds.password === "string"
    ) {
      return creds as SavedCredentials;
    }
    return null;
  } catch {
    return null;
  }
};

const saveCredentials = async (email: string, password: string) => {
  try {
    await chrome.storage.local.set({
      authCredentials: { email, password },
    });
  } catch {
    // ignore storage errors
  }
};

const attemptAutoSignIn = async (): Promise<boolean> => {
  const creds = await getSavedCredentials();
  if (!creds) return false;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  });
  if (error) return false;
  return !!data.session;
};

const safeSendRuntimeMessage = (
  msg: AnalyzeResultMsg | ChatResponseMsg | StatusMsg | ErrorMsg,
) => {
  try {
    const result = chrome.runtime.sendMessage(msg);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch (error) {
    // ignore missing listeners (e.g., panel not open)
  }
};

const safeSendTabMessage = (
  tabId: number,
  msg: AnalyzeResultMsg | ChatResponseMsg | StatusMsg | ErrorMsg,
) => {
  try {
    const result = chrome.tabs.sendMessage(tabId, msg);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch (error) {
    // ignore missing listeners (e.g., content script not injected)
  }
};

const sendStatus = (tabId: number, message: string) => {
  const msg: StatusMsg = { type: "STATUS", tabId, message };
  safeSendRuntimeMessage(msg);
};

const sendError = (tabId: number, message: string) => {
  const msg: ErrorMsg = { type: "ERROR", tabId, message };
  safeSendRuntimeMessage(msg);
};

const sendAnalyzeResult = (tabId: number, result: AnalyzeResult) => {
  const msg: AnalyzeResultMsg = { type: "ANALYZE_RESULT", tabId, result };
  safeSendRuntimeMessage(msg);
  safeSendTabMessage(tabId, msg);
};

const sendChatResponse = (tabId: number, message: ChatMessage) => {
  const msg: ChatResponseMsg = { type: "CHAT_RESPONSE", tabId, message };
  safeSendRuntimeMessage(msg);
  safeSendTabMessage(tabId, msg);
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
    suggested_questions: [
      "Is this good value for money?",
      "What do reviews say about it?",
      "How does it compare to similar products?",
    ],
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

    if (message.type === "CHECK_AUTH") {
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            sendResponse({ isAuthenticated: true });
            return;
          }

          const autoSignedIn = await attemptAutoSignIn();
          if (!autoSignedIn) {
            sendResponse({ isAuthenticated: false });
            return;
          }

          const { data: { session: refreshed } } = await supabase.auth.getSession();
          sendResponse({ isAuthenticated: !!refreshed });
        } catch (error) {
          sendResponse({ isAuthenticated: false, error: "Auth check failed" });
        }
      })();
      return true;
    }

    if (message.type === "SIGN_IN") {
      (async () => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: message.email,
            password: message.password,
          });
          if (error) {
            sendResponse({ error: error.message });
          } else {
            await saveCredentials(message.email, message.password);
            sendResponse({ ok: true });
          }
        } catch (error: any) {
          sendResponse({ error: error.message || "Sign in failed" });
        }
      })();
      return true;
    }

    if (message.type === "SIGN_UP") {
      (async () => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: message.email,
            password: message.password,
          });
          if (error) {
            sendResponse({ error: error.message });
          } else {
            await saveCredentials(message.email, message.password);
            sendResponse({ ok: true });
          }
        } catch (error: any) {
          sendResponse({ error: error.message || "Sign up failed" });
        }
      })();
      return true;
    }

    if (message.type === "CHECK_PREFERENCES") {
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            sendResponse({ hasPreferences: false });
            return;
          }

          const { data, error } = await supabase
            .from("user_preferences")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

          sendResponse({ hasPreferences: !!data && !error });
        } catch (error) {
          sendResponse({ hasPreferences: false });
        }
      })();
      return true;
    }

    if (message.type === "GET_PREFERENCES") {
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            sendResponse({ preferences: null });
            return;
          }

          const { data, error } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            sendResponse({ preferences: null, error: error.message });
          } else {
            sendResponse({ preferences: data || null });
          }
        } catch (error: any) {
          sendResponse({ preferences: null, error: error.message });
        }
      })();
      return true;
    }

    if (message.type === "SAVE_PREFERENCES") {
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            sendResponse({ error: "Not authenticated" });
            return;
          }

          const { error } = await supabase
            .from("user_preferences")
            .upsert({
              user_id: session.user.id,
              price_sensitivity: message.preferences.price || null,
              quality_preference: message.preferences.quality || null,
              brand_preference: message.preferences.brand || null,
              sustainability: message.preferences.sustainability || null,
              review_dependency: message.preferences.reviews || null,
              innovation_adoption: message.preferences.innovation || null,
            }, {
              onConflict: "user_id",
            });

          if (error) {
            sendResponse({ error: error.message });
          } else {
            sendResponse({ ok: true });
          }
        } catch (error: any) {
          sendResponse({ error: error.message || "Failed to save preferences" });
        }
      })();
      return true;
    }

    return false;
  },
);
