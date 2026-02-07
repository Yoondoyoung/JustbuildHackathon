import type { ChatMessage } from "../../shared/types";
import { formatChatContent } from "../../shared/formatChatContent";

export const renderChat = (container: HTMLElement, message: ChatMessage) => {
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
