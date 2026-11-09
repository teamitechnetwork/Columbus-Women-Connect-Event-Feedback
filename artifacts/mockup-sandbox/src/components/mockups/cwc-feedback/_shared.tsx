import { useState, type FormEvent } from "react";

type CopyVersion = "current" | "cleaner";

const copy = {
  current: {
    eyebrow: "Your voice shapes what comes next",
    title: "Thank you for being part of it.",
    intro:
      "We’re grateful you joined us. Share a little about your experience so we can make the next gathering even more meaningful.",
    formTitle: "Conference reflection",
    formIntro: "A few thoughtful answers are all we need.",
    about: "A little about you",
    experience: "Your experience",
    connection: "Stay connected, your way",
    rating: "Overall, how would you rate the conference?",
    valuable: "What was most valuable to you?",
    valuableHint: "A moment, conversation, resource, or idea that stayed with you…",
    improve: "What could we improve for next time?",
    improveHint: "Your honest thoughts help us make this better.",
    topics: "What topics or support would you like at future events?",
    topicsHint: "Tell us what would be useful for you and your community.",
    followup: "Would you like someone from our team to follow up with you?",
    followupHint: "A personal conversation about your feedback or support needs.",
    updates: "Would you like updates about future Columbus Women Connect events?",
    updatesHint: "We’ll only use your email for the updates you choose here.",
    privacy:
      "Your contact choices are yours. We’ll respect what you select and use your feedback to help shape future gatherings.",
    submit: "Send my feedback",
    submitNote: "Your feedback helps the organizing team shape future gatherings.",
    thanks: "Thank you for sharing.",
    thanksText:
      "Your feedback has been received. We appreciate the time and care you put into helping Columbus Women Connect grow.",
    thanksFollowup:
      "We’ll be in touch only if you asked us to follow up or receive future event updates.",
  },
  cleaner: {
    eyebrow: "Conference feedback",
    title: "Your feedback matters.",
    intro:
      "Thank you for joining us. Tell us what worked and what we can improve for next time.",
    formTitle: "Share your feedback",
    formIntro: "Answer a few questions about the event.",
    about: "About you",
    experience: "Your experience",
    connection: "Stay in touch",
    rating: "How would you rate the event overall?",
    valuable: "What did you enjoy most?",
    valuableHint: "A speaker, conversation, or moment you enjoyed.",
    improve: "What could be better next time?",
    improveHint: "What is one thing we could improve?",
    topics: "What would you like at future events?",
    topicsHint: "Share a topic, resource, or kind of support.",
    followup: "Would you like us to follow up with you?",
    followupHint: "Choose yes if you’d like a personal follow-up.",
    updates: "Would you like updates about future events?",
    updatesHint: "Choose yes to hear about upcoming events.",
    privacy: "We’ll contact you only based on the choices you make above.",
    submit: "Submit feedback",
    submitNote: "Your feedback helps shape future events.",
    thanks: "Thank you for your feedback.",
    thanksText:
      "Your response will help Columbus Women Connect plan future gatherings.",
    thanksFollowup: "We’ll contact you only if you asked us to.",
  },
} satisfies Record<CopyVersion, Record<string, string>>;

export function FeedbackMockup({ version }: { version: CopyVersion }) {
  const [submitted, setSubmitted] = useState(false);
  const text = copy[version];
  const clean = version === "cleaner";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className={`feedback-shell ${clean ? "clean-copy" : ""}`}>
      <div className="feedback-wrap">
        <header className="brand-row">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">CWC</div>
            <div className="brand-name">Columbus<br />Women Connect</div>
          </div>
          <div className="event-chip">Third Multicultural Annual Conference</div>
        </header>

        <section className="intro">
          <div className="eyebrow">{text.eyebrow}</div>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
        </section>

        {submitted ? (
          <section className="success-card" role="status">
            <div className="success-symbol" aria-hidden="true">✓</div>
            <h2>{text.thanks}</h2>
            <p>{text.thanksText}</p>
            <div className="success-divider" />
            <p>{text.thanksFollowup}</p>
          </section>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-topline">
              <div>
                <h2>{text.formTitle}</h2>
                <p>{text.formIntro}</p>
              </div>
              <span className="required-note">* Required</span>
            </div>

            <section className="form-section">
              <div className="section-heading">
                {!clean && <span className="section-number">01</span>}
                <h3>{text.about}</h3>
              </div>
              <div className="field-grid">
                <div className="field full">
                  <label htmlFor={`${version}-name`}>Full name <span aria-hidden="true">*</span></label>
                  <input id={`${version}-name`} type="text" placeholder="Your name" required />
                </div>
                <div className="field">
                  <label htmlFor={`${version}-email`}>Email address <span aria-hidden="true">*</span></label>
                  <input id={`${version}-email`} type="email" placeholder="you@example.com" required />
                </div>
                <div className="field">
                  <label htmlFor={`${version}-phone`}>Phone number <span className="optional">(optional)</span></label>
                  <input id={`${version}-phone`} type="tel" placeholder="(614) 555-0123" />
                </div>
                <div className="field full">
                  <label htmlFor={`${version}-organization`}>Organization <span className="optional">(optional)</span></label>
                  <input id={`${version}-organization`} type="text" placeholder="Organization or community" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                {!clean && <span className="section-number">02</span>}
                <h3>{text.experience}</h3>
              </div>
              <fieldset className="rating-fieldset">
                <legend className="rating-question">{text.rating} <span aria-hidden="true">*</span></legend>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div className="rating-option" key={rating}>
                      <input id={`${version}-rating-${rating}`} type="radio" name={`${version}-rating`} value={rating} required />
                      <label htmlFor={`${version}-rating-${rating}`}>
                        <span className="rating-num">{rating}</span>
                        <span className="rating-caption">{rating === 1 ? (clean ? "Poor" : "Not for me") : rating === 3 ? (clean ? "Good" : "It was good") : rating === 5 ? (clean ? "Excellent" : "Loved it") : "\u00a0"}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="rating-anchors"><span>1 — {clean ? "Needs improvement" : "Needs work"}</span><span>5 — Excellent</span></div>
              </fieldset>
              <div className="field-grid experience-fields">
                <div className="field full">
                  <label htmlFor={`${version}-valuable`}>{text.valuable} <span className="optional">(optional)</span></label>
                  <textarea id={`${version}-valuable`} placeholder={text.valuableHint} />
                </div>
                <div className="field full">
                  <label htmlFor={`${version}-improve`}>{text.improve} <span className="optional">(optional)</span></label>
                  <textarea id={`${version}-improve`} placeholder={text.improveHint} />
                </div>
                <div className="field full">
                  <label htmlFor={`${version}-topics`}>{text.topics} <span className="optional">(optional)</span></label>
                  <textarea className="tall" id={`${version}-topics`} placeholder={text.topicsHint} />
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                {!clean && <span className="section-number">03</span>}
                <h3>{text.connection}</h3>
              </div>
              <div className="choice-block">
                <span className="choice-title">{text.followup}</span>
                <p className="choice-hint">{text.followupHint}</p>
                <div className="radio-row">
                  <button type="button" className="radio-option-button">Yes, please</button>
                  <button type="button" className="radio-option-button">{clean ? "No, thanks" : "Not right now"}</button>
                </div>
              </div>
              <div className="choice-block">
                <span className="choice-title">{text.updates}</span>
                <p className="choice-hint">{text.updatesHint}</p>
                <div className="radio-row">
                  <button type="button" className="radio-option-button">{clean ? "Yes, send updates" : "Yes, keep me posted"}</button>
                  <button type="button" className="radio-option-button">{clean ? "No, thanks" : "No, thank you"}</button>
                </div>
              </div>
            </section>

            <div className="privacy-note">
              <span className="privacy-mark" aria-hidden="true">i</span>
              <span>{text.privacy}</span>
            </div>

            <div className="submit-row">
              <p className="submit-note">{text.submitNote}</p>
              <button className="submit-button" type="submit">{text.submit}<span className="submit-arrow" aria-hidden="true">→</span></button>
            </div>
          </form>
        )}

        <footer className="footer-line">
          <span><strong>Columbus Women Connect</strong> · The Thrive Blueprint</span>
          <span>November 7, 2026 · 2–6 PM</span>
        </footer>
      </div>
    </main>
  );
}
