import type { AnalyzeResult } from "../../shared/types";

const formatPrice = (value: number, currency: string): string => {
  if (currency === "USD") return `$${value.toFixed(2)}`;
  return `${value} ${currency}`;
};

const renderStars = (rating: number): string => {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = "";
  for (let i = 0; i < 5; i++) {
    const filled = i < full || (i === full && hasHalf);
    html += `<span class="star ${filled ? "" : "outline"}" aria-hidden="true">${filled ? "★" : "☆"}</span>`;
  }
  return html;
};

const dollarIcon = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const starIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const peopleIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

export type RenderAnalyzeOptions = {
  overviewEl?: HTMLElement | null;
  highlightsEl?: HTMLElement | null;
  specsEl?: HTMLElement | null;
  quickQuestionsEl?: HTMLElement | null;
};

export const renderAnalyze = (
  container: HTMLElement,
  result: AnalyzeResult,
  onSuggestedQuestionClick?: (question: string) => void,
  options?: RenderAnalyzeOptions
) => {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "product-title";
  title.textContent = result.title ?? "Product";
  container.appendChild(title);

  if (result.price) {
    const block = document.createElement("div");
    block.className = "metric-block";
    block.innerHTML = `
      <div class="metric-icon" aria-hidden="true">${dollarIcon}</div>
      <div class="metric-content">
        <p class="metric-label">Price</p>
        <p class="metric-value">${formatPrice(result.price.value, result.price.currency)}</p>
      </div>
    `;
    container.appendChild(block);
  }

  if (result.rating !== undefined) {
    const block = document.createElement("div");
    block.className = "metric-block";
    block.innerHTML = `
      <div class="metric-icon" aria-hidden="true">${starIcon}</div>
      <div class="metric-content">
        <p class="metric-label">Customer Rating</p>
        <div class="metric-value metric-value-rating">
          <div class="stars">${renderStars(result.rating)}</div>
          <span>${result.rating.toFixed(1)}</span>
        </div>
      </div>
    `;
    container.appendChild(block);
  }

  if (result.review_count !== undefined) {
    const block = document.createElement("div");
    block.className = "metric-block";
    const reviewText =
      result.review_count === 1
        ? "1 review"
        : `${result.review_count.toLocaleString()} reviews`;
    block.innerHTML = `
      <div class="metric-icon" aria-hidden="true">${peopleIcon}</div>
      <div class="metric-content">
        <p class="metric-label">Reviews</p>
        <p class="metric-value">${reviewText}</p>
      </div>
    `;
    container.appendChild(block);
  }

  if (options?.overviewEl) {
    options.overviewEl.hidden = false;
    options.overviewEl.innerHTML = "";
    const summary = result.summary ?? "No summary available.";
    const p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = summary;
    options.overviewEl.appendChild(p);
  }

  if (options?.highlightsEl) {
    options.highlightsEl.innerHTML = "";
    if (result.key_points?.length) {
      const ul = document.createElement("ul");
      ul.style.margin = "0";
      ul.style.paddingLeft = "18px";
      result.key_points.forEach((point) => {
        const li = document.createElement("li");
        li.textContent = point;
        ul.appendChild(li);
      });
      options.highlightsEl.appendChild(ul);
    } else {
      const p = document.createElement("p");
      p.style.margin = "0";
      p.style.color = "var(--text-secondary)";
      p.textContent = "No highlights available.";
      options.highlightsEl.appendChild(p);
    }
  }

  if (options?.specsEl) {
    options.specsEl.innerHTML = "";
    if (result.specs && Object.keys(result.specs).length > 0) {
      Object.entries(result.specs).forEach(([key, value]) => {
        const row = document.createElement("div");
        row.className = "spec-row";
        row.innerHTML = `<span class="spec-key">${escapeHtml(key)}</span><span class="spec-val">${escapeHtml(value)}</span>`;
        options.specsEl!.appendChild(row);
      });
    } else {
      const p = document.createElement("p");
      p.style.margin = "0";
      p.style.color = "var(--text-secondary)";
      p.textContent = "No specs available.";
      options.specsEl.appendChild(p);
    }
  }

  if (options?.quickQuestionsEl && result.suggested_questions?.length) {
    options.quickQuestionsEl.innerHTML = "";
    result.suggested_questions.forEach((question) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-btn";
      btn.textContent = question;
      if (onSuggestedQuestionClick) {
        btn.addEventListener("click", () => onSuggestedQuestionClick(question));
      }
      options.quickQuestionsEl!.appendChild(btn);
    });
  }
};

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
