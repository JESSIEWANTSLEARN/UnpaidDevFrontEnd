import React from "react";

/** FAQ form used by Super Admin website-content management. */
export default function FaqEditor({ faq, onChange }) {
    return (
        <div className="wc-form-grid">
            <label>
                <span>Category</span>
                <input
                    value={faq.category}
                    maxLength={100}
                    onChange={(event) =>
                        onChange("category", event.target.value)
                    }
                />
            </label>

            <label>
                <span>Display Order</span>
                <input
                    type="number"
                    value={faq.sort_order}
                    onChange={(event) =>
                        onChange("sort_order", event.target.value)
                    }
                />
            </label>

            <label className="wc-span-2">
                <span>Question</span>
                <input
                    value={faq.question}
                    maxLength={500}
                    onChange={(event) =>
                        onChange("question", event.target.value)
                    }
                />
            </label>

            <label className="wc-span-2">
                <span>Answer</span>
                <textarea
                    rows={5}
                    maxLength={5000}
                    value={faq.answer}
                    onChange={(event) => onChange("answer", event.target.value)}
                />
            </label>

            <label className="wc-check">
                <input
                    type="checkbox"
                    checked={faq.is_active}
                    onChange={(event) =>
                        onChange("is_active", event.target.checked)
                    }
                />
                Show this FAQ publicly
            </label>
        </div>
    );
}
