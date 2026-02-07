import type { AnalyzeResult } from "../../shared/types";

export const renderAnalyze = (
  container: HTMLElement,
  result: AnalyzeResult,
  onSuggestedQuestionClick?: (question: string) => void
) => {
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
      btn.style.border = "1px solid var(--border, #e0e0e0)";
      btn.style.borderRadius = "4px";
      btn.style.background = "var(--bg-secondary, #f5f5f5)";
      btn.style.fontSize = "0.9rem";
      if (onSuggestedQuestionClick) {
        btn.addEventListener("click", () => onSuggestedQuestionClick(question));
      }
      section.appendChild(btn);
    });

    container.appendChild(section);
  }
};
