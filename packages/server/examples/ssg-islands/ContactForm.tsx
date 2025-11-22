/** @jsxImportSource @semajsx/dom */

import { signal, computed } from "@semajsx/signal";
import { island } from "@semajsx/server/client";

/**
 * ContactForm island - demonstrates form handling with signals
 */
export const ContactForm = island(
  function ContactForm() {
    const name = signal("");
    const email = signal("");
    const message = signal("");
    const submitted = signal(false);

    const isValid = computed(
      () =>
        name.value.length > 0 &&
        email.value.includes("@") &&
        message.value.length > 10,
    );

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (isValid.value) {
        submitted.value = true;
        // Reset after 3 seconds
        setTimeout(() => {
          submitted.value = false;
          name.value = "";
          email.value = "";
          message.value = "";
        }, 3000);
      }
    };

    return (
      <div
        style={{
          padding: "20px",
          border: "2px solid #10b981",
          borderRadius: "8px",
          margin: "10px 0",
          background: "#f0fdf4",
        }}
      >
        <h4 style={{ margin: "0 0 15px 0", color: "#065f46" }}>
          Contact Form (Island)
        </h4>

        {submitted.value ? (
          <div
            style={{
              padding: "20px",
              background: "#d1fae5",
              borderRadius: "4px",
              textAlign: "center",
              color: "#065f46",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Message sent successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onInput={(e: Event) =>
                  (name.value = (e.target as HTMLInputElement).value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                placeholder="Your name"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onInput={(e: Event) =>
                  (email.value = (e.target as HTMLInputElement).value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                placeholder="your@email.com"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Message
              </label>
              <textarea
                value={message}
                onInput={(e: Event) =>
                  (message.value = (e.target as HTMLTextAreaElement).value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  minHeight: "80px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                placeholder="Your message (min 10 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={!isValid.value}
              style={{
                padding: "10px 20px",
                background: isValid.value ? "#10b981" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isValid.value ? "pointer" : "not-allowed",
                width: "100%",
              }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    );
  },
  import.meta.url,
);
