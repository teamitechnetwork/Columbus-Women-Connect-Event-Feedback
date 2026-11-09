import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateFeedback } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Form } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const feedbackFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  phone: z.string().max(40),
  organization: z.string().max(120),
  overallRating: z.coerce.number().int().min(1, 'Please choose a rating.').max(5),
  mostValuable: z.string().max(2000),
  improvements: z.string().max(2000),
  futureTopics: z.string().max(2000),
  contactRequested: z.preprocess((v) => v === true || v === 'yes', z.boolean()),
  futureUpdates: z.preprocess((v) => v === true || v === 'yes', z.boolean()),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

function PartnerLogos({ placement }: { placement: 'header' | 'confirmation' }) {
  return (
    <div
      className={`partner-logos partner-logos--${placement}`}
      role="group"
      aria-label="Columbus Women Connect and B4P Code Found"
    >
      <img
        className="partner-logo partner-logo--cwc"
        src="/cwc-logo.png"
        alt="Columbus Women Connect"
        width="212"
        height="91"
      />
      <span className="partner-logos-divider" aria-hidden="true" />
      <img
        className="partner-logo partner-logo--b4p"
        src="/b4p-logo.jpg"
        alt="B4P Code Found"
        width="715"
        height="715"
      />
    </div>
  );
}

function Home() {
  const createFeedback = useCreateFeedback();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      overallRating: 0,
      mostValuable: '',
      improvements: '',
      futureTopics: '',
      contactRequested: false,
      futureUpdates: false,
    },
  });

  function handleSubmit(values: FeedbackFormValues) {
    setSubmitError('');
    createFeedback.mutate(
      {
        data: values,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => setSubmitError('We could not send your response just now. Please try again in a moment.'),
      },
    );
  }

  return (
    <main className="feedback-shell clean-copy">
      <div className="feedback-wrap">
        <header className="brand-row" data-testid="header-conference-feedback">
          <PartnerLogos placement="header" />
          <div className="event-chip" data-testid="text-conference-name">Third Multicultural Annual Conference</div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow">Conference feedback</div>
          <h1 id="page-title" data-testid="text-form-title">Your feedback matters.</h1>
          <p data-testid="text-form-introduction">
            Thank you for joining us. Tell us what worked and what we can improve for next time.
          </p>
        </section>

        {submitted ? (
          <section className="success-card" role="status" aria-live="polite" data-testid="status-submission-success">
            <div className="success-symbol" aria-hidden="true">✓</div>
            <h2>Thank you for sharing.</h2>
            <p>Your response will help Columbus Women Connect plan future gatherings.</p>
            <div className="success-divider" />
            <p>We’ll contact you only if you asked us to.</p>
            <PartnerLogos placement="confirmation" />
          </section>
        ) : (
          <Form {...form}>
          <form className="form-card" onSubmit={form.handleSubmit(handleSubmit)} data-testid="form-event-feedback">
            <div className="form-topline">
              <div>
                <h2>Share your feedback</h2>
                <p>Answer a few questions about the event.</p>
              </div>
              <span className="required-note">* Required</span>
            </div>

            <section className="form-section" aria-labelledby="section-about">
              <div className="section-heading">
                <h3 id="section-about">About you</h3>
              </div>
              <div className="field-grid">
                <div className="field full">
                  <label htmlFor="fullName">Full name <span aria-hidden="true">*</span></label>
                  <input id="fullName" {...form.register('fullName')} type="text" autoComplete="name" placeholder="Your name" required data-testid="input-full-name" />
                </div>
                <div className="field">
                  <label htmlFor="email">Email address <span aria-hidden="true">*</span></label>
                  <input id="email" {...form.register('email')} type="email" autoComplete="email" placeholder="you@example.com" required data-testid="input-email" />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone number <span className="optional">(optional)</span></label>
                  <input id="phone" {...form.register('phone')} type="tel" autoComplete="tel" placeholder="(614) 555-0123" data-testid="input-phone" />
                </div>
                <div className="field full">
                  <label htmlFor="organization">Organization <span className="optional">(optional)</span></label>
                  <input id="organization" {...form.register('organization')} type="text" autoComplete="organization" placeholder="Organization or community" data-testid="input-organization" />
                </div>
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-experience">
              <div className="section-heading">
                <h3 id="section-experience">Your experience</h3>
              </div>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="rating-question">How would you rate the event overall? <span aria-hidden="true">*</span></legend>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div className="rating-option" key={rating}>
                      <input id={`rating-${rating}`} {...form.register('overallRating')} type="radio" value={rating} required data-testid={`radio-rating-${rating}`} />
                      <label htmlFor={`rating-${rating}`}>
                        <span className="rating-num">{rating}</span>
                        <span className="rating-caption">{rating === 1 ? 'Poor' : rating === 3 ? 'Good' : rating === 5 ? 'Excellent' : '\u00a0'}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="rating-anchors"><span>1 — Needs improvement</span><span>5 — Excellent</span></div>
              </fieldset>
              <div className="field-grid" style={{ marginTop: 22 }}>
                <div className="field full">
                  <label htmlFor="mostValuable">What did you enjoy most? <span className="optional">(optional)</span></label>
                  <textarea id="mostValuable" {...form.register('mostValuable')} placeholder="A speaker, conversation, or moment you enjoyed." data-testid="textarea-most-valuable" />
                </div>
                <div className="field full">
                  <label htmlFor="improvements">What could be better next time? <span className="optional">(optional)</span></label>
                  <textarea id="improvements" {...form.register('improvements')} placeholder="What is one thing we could improve?" data-testid="textarea-improvements" />
                </div>
                <div className="field full">
                  <label htmlFor="futureTopics">What would you like at future events? <span className="optional">(optional)</span></label>
                  <textarea className="tall" id="futureTopics" {...form.register('futureTopics')} placeholder="Share a topic, resource, or kind of support." data-testid="textarea-future-topics" />
                </div>
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-stay-connected">
              <div className="section-heading">
                <h3 id="section-stay-connected">Stay in touch</h3>
              </div>
              <div className="choice-block">
                <span className="choice-title" id="contact-label">Would you like us to follow up with you?</span>
                <p className="choice-hint">Choose yes if you’d like a personal follow-up.</p>
                <div className="radio-row" role="radiogroup" aria-labelledby="contact-label">
                  {['yes', 'no'].map((answer) => (
                    <div className="radio-option" key={answer}>
                      <input id={`contact-${answer}`} {...form.register('contactRequested')} type="radio" value={answer} data-testid={`radio-contact-${answer}`} />
                      <label htmlFor={`contact-${answer}`}>{answer === 'yes' ? 'Yes, please' : 'No, thanks'}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="choice-block">
                <span className="choice-title" id="updates-label">Would you like updates about future events?</span>
                <p className="choice-hint">Choose yes to hear about upcoming events.</p>
                <div className="radio-row" role="radiogroup" aria-labelledby="updates-label">
                  {['yes', 'no'].map((answer) => (
                    <div className="radio-option" key={answer}>
                      <input id={`updates-${answer}`} {...form.register('futureUpdates')} type="radio" value={answer} data-testid={`radio-updates-${answer}`} />
                      <label htmlFor={`updates-${answer}`}>{answer === 'yes' ? 'Yes, send updates' : 'No, thanks'}</label>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="privacy-note" data-testid="text-privacy-note">
              <span className="privacy-mark" aria-hidden="true">i</span>
              <span>We’ll contact you only based on the choices you make above.</span>
            </div>

            {submitError && <p className="form-error" role="alert" data-testid="status-submit-error">{submitError}</p>}

            <div className="submit-row">
              <p className="submit-note">Your feedback helps shape future events.</p>
              <button className="submit-button" type="submit" disabled={createFeedback.isPending} data-testid="button-submit-feedback">
                {createFeedback.isPending ? 'Submitting…' : 'Submit feedback'}
                {!createFeedback.isPending && <span className="submit-arrow" aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
          </Form>
        )}

        <footer className="footer-line" data-testid="footer-feedback">
          <span><strong>Columbus Women Connect</strong> · The Thrive Blueprint</span>
          <span>November 7, 2026 · 2–6 PM</span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
