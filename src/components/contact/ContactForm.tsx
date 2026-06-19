'use client';

type ContactFormProps = {
  title: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  note: string;
  submitLabel: string;
};

export function ContactForm({
  title,
  nameLabel,
  emailLabel,
  messageLabel,
  note,
  submitLabel,
}: ContactFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)] mb-8">
        {title}
      </h2>

      <form className="form-panel space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-field">
            <label
              htmlFor="contact-name"
              className="form-label"
            >
              {nameLabel}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label
              htmlFor="contact-email"
              className="form-label"
            >
              {emailLabel}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-field">
          <label
            htmlFor="contact-message"
            className="form-label"
          >
            {messageLabel}
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            className="form-textarea"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-[var(--color-brand-text-subtle)]">
            {note}
          </p>
          <button
            type="submit"
            className="form-submit flex-shrink-0"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
