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

  const title = document.createElement("h2");
  title.textContent = result.title ?? "Analyze";
  container.appendChild(title);

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
};

const renderChat = (container: HTMLElement, message: ChatMessage) => {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${message.role}`;

  const text = document.createElement("div");
  text.className = "chat-text";
  text.textContent = message.content;

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
  host.style.inset = "16px 16px auto auto";
  host.style.top = "16px";
  host.style.right = "16px";
  host.style.left = "auto";
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
        box-shadow: 0 8px 30px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; }
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
      .chat-log { max-height: 220px; overflow-y: auto; font-size: 13px; }
      .chat-message { padding: 8px; border-radius: 10px; margin-bottom: 8px; background: #f3f4f6; }
      .chat-message.user { background: #e0ecff; }
      .chat-citations a { display: block; font-size: 11px; color: #3b82f6; }
      .chat-input { padding: 12px 16px 16px; border-top: 1px solid #eee; background: #fff; position: relative; }
      .chat-input textarea { width: 100%; padding: 12px 48px 12px 12px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f9fafb; resize: none; outline: none; font-size: 13px; }
      .chat-input button { position: absolute; right: 22px; bottom: 22px; }
    </style>
    <div class="sidebar">
      <div class="header">
        <div class="title">ShopSense</div>
        <div class="status"><span class="dot" id="ss-status-dot"></span><span id="ss-status-text">Idle</span></div>
      </div>
      <div class="action">
        <button id="ss-analyze" class="btn btn-secondary" type="button">Analyze Page</button>
      </div>
      <div class="content">
        <section id="ss-analyze" class="panel"></section>
        <section class="panel">
          <h2>Chat</h2>
          <div id="ss-chat" class="chat-log"></div>
        </section>
      </div>
      <form id="ss-chat-form" class="chat-input">
        <textarea id="ss-chat-input" rows="2" placeholder="Ask about this product..."></textarea>
        <button class="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  `;

  document.documentElement.appendChild(host);
  sidebarHost = host;

  statusDot = shadow.querySelector("#ss-status-dot") as HTMLSpanElement;
  statusText = shadow.querySelector("#ss-status-text") as HTMLSpanElement;
  analyzeContainer = shadow.querySelector("#ss-analyze") as HTMLDivElement;
  chatContainer = shadow.querySelector("#ss-chat") as HTMLDivElement;
  chatInput = shadow.querySelector("#ss-chat-input") as HTMLTextAreaElement;

  const analyzeButton = shadow.querySelector("#ss-analyze") as HTMLButtonElement;
  const chatForm = shadow.querySelector("#ss-chat-form") as HTMLFormElement;

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

const textFromSelectors = (selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return undefined;
};

const metaContent = (names: string[]): string | undefined => {
  for (const name of names) {
    const el = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`,
    );
    const content = el?.getAttribute("content")?.trim();
    if (content) return content;
  }
  return undefined;
};

const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const extractSpecs = (): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};

  document.querySelectorAll("table").forEach((table) => {
    table.querySelectorAll("tr").forEach((row) => {
      const key = row.querySelector("th")?.textContent?.trim();
      const value = row.querySelector("td")?.textContent?.trim();
      if (key && value) specs[key] = value;
    });
  });

  document.querySelectorAll("dl").forEach((dl) => {
    const terms = Array.from(dl.querySelectorAll("dt"));
    terms.forEach((term) => {
      const key = term.textContent?.trim();
      const value = term.nextElementSibling?.textContent?.trim();
      if (key && value) specs[key] = value;
    });
  });

  return Object.keys(specs).length > 0 ? specs : undefined;
};

const extractVisibleReviews = (): string[] | undefined => {
  const selectors = [
    "[itemprop=review]",
    "[data-hook=review]",
    ".review",
    ".reviews-list .review-item",
  ];

  const reviews: string[] = [];
  document.querySelectorAll(selectors.join(",")).forEach((el) => {
    if (reviews.length >= 5) return;
    const text = el.textContent?.trim();
    if (text && text.length > 20) {
      reviews.push(text.replace(/\s+/g, " "));
    }
  });

  return reviews.length > 0 ? reviews : undefined;
};

const extract = (): Extracted => {
  const title =
    metaContent(["og:title", "twitter:title"]) ||
    textFromSelectors(["h1", "[itemprop=name]", "[data-test=product-title]"]) ||
    document.title;

  const brand =
    metaContent(["product:brand", "og:brand"]) ||
    textFromSelectors([
      "[itemprop=brand]",
      "[data-brand]",
      ".brand",
      ".product-brand",
    ]);

  const model =
    metaContent(["product:mpn", "product:model"]) ||
    textFromSelectors(["[itemprop=mpn]", "[data-model]"]);

  const priceValue =
    metaContent(["product:price:amount", "price", "og:price:amount"]) ||
    textFromSelectors([
      "[itemprop=price]",
      "[data-test=product-price]",
      ".price",
    ]);

  const priceCurrency =
    metaContent(["product:price:currency", "price:currency"]) ||
    document.querySelector("[itemprop=priceCurrency]")?.getAttribute("content") ||
    "USD";

  const ratingValue =
    metaContent(["rating", "ratingValue"]) ||
    textFromSelectors([
      "[itemprop=ratingValue]",
      "[data-test=rating]",
      ".rating",
    ]);

  const reviewCount =
    metaContent(["reviewCount"]) ||
    textFromSelectors([
      "[itemprop=reviewCount]",
      "[data-hook=total-review-count]",
      ".review-count",
    ]);

  const priceNumber = parseNumber(priceValue);

  return {
    page_url: location.href,
    store_domain: location.host,
    title,
    brand,
    model,
    price:
      priceNumber !== undefined
        ? { value: priceNumber, currency: priceCurrency }
        : undefined,
    rating: parseNumber(ratingValue),
    review_count: parseNumber(reviewCount),
    key_specs: extractSpecs(),
    visible_reviews: extractVisibleReviews(),
  };
};

chrome.runtime.onMessage.addListener(
  (
    message: ExtractRequest | AnalyzeResultMsg | ChatResponseMsg | StatusMsg | ErrorMsg,
    _sender,
    sendResponse,
  ) => {
    if (message.type === "EXTRACT_REQUEST") {
      sendResponse(extract());
      return true;
    }

    if (message.tabId && currentTabId && message.tabId !== currentTabId) {
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
