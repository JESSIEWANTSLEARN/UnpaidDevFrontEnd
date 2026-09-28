import React from "react";

const GENERAL = [
  "How do I place an order?",
  "How can I track my order?",
  "How does payment work?",
  "How does delivery work?",
];

function questionsForContext(context) {
  if (!context) {
    return GENERAL;
  }

  if (context.type === "product") {
    return [
      "Is this product currently in stock?",
      "Tell me more about this product.",
      "How do I order this product?",
      "What are the product details?",
    ];
  }

  const status = String(context.value?.status || "").toUpperCase();

  if (status === "PENDING") {
    return [
      "When will this order be processed?",
      "Can I cancel this order?",
      "How does payment work for this order?",
    ];
  }

  if (status === "PROCESSING" || status === "CONFIRMED") {
    return [
      "What is the status of this order?",
      "When will this order be fulfilled?",
      "Can I change my delivery information?",
    ];
  }

  if (status === "FULFILLED") {
    return [
      "How do I leave a review for this order?",
      "I received a damaged or defective item. What should I do?",
      "I have a problem with this completed order.",
    ];
  }

  if (status === "CANCELLED" || status === "UNFULFILLED") {
    return [
      "Why was this order cancelled or unfulfilled?",
      "Can I order these products again?",
      "What happens to my payment?",
    ];
  }

  return GENERAL;
}

export default function SupportQuickReplies({
  context,
  busy,
  onSelect,
}) {
  return (
    <div className="wbo-support-quick">
      <span>Quick help</span>

      <div>
        {questionsForContext(context).map((question) => (
          <button
            type="button"
            key={question}
            disabled={busy}
            onClick={() => onSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}