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
  overallRating: z.number().int().min(1).max(5),
  mostValuable: z.string().max(2000),
  improvements: z.string().max(2000),
  futureTopics: z.string().max(2000),
  contactRequested: z.boolean(),
  futureUpdates: z.boolean(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

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
    <main className="feedback-shell">
      <div className="feedback-wrap">
        <header className="brand-row" data-testid="header-conference-feedback">
          <div className="brand-lockup" data-testid="brand-columbus-women-connect">
            <div className="brand-mark" aria-hidden="true">CWC</div>
            <div className="brand-name">Columbus<br />Women Connect</div>
          </div>
          <div className="event-chip" data-testid="text-conference-name">Third Multicultural Annual Conference</div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow">Your voice shapes what comes next</div>
          <h1 id="page-title" data-testid="text-form-title">Thank you for being part of it.</h1>
          <p data-testid="text-form-introduction">
            We’re grateful you joined us. Share a little about your experience so we can make the next gathering even more meaningful.
          </p>
        </section>

        {submitted ? (
          <section className="success-card" role="status" aria-live="polite" data-testid="status-submission-success">
            <div className="success-symbol" aria-hidden="true">✓</div>
            <h2>Thank you for sharing.</h2>
            <p>Your feedback has been received. We appreciate the time and care you put into helping Columbus Women Connect grow.</p>
            <div className="success-divider" />
            <p>We’ll be in touch only if you asked us to follow up or receive future event updates.</p>
          </section>
        ) : (
          <Form {...form}>
          <form className="form-card" onSubmit={form.handleSubmit(handleSubmit)} data-testid="form-event-feedback">
            <div className="form-topline">
              <div>
                <h2>Conference reflection</h2>
                <p>A few thoughtful answers are all we need.</p>
              </div>
              <span className="required-note">* Required</span>
            </div>

            <section className="form-section" aria-labelledby="section-about">
              <div className="section-heading">
                <span className="section-number">01</span>
                <h3 id="section-about">A little about you</h3>
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
                  <input id="organization" {...form.register('organization')} type="text" autoComplete="organization" placeholder="Organization or community you represent" data-testid="input-organization" />
                </div>
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-experience">
              <div className="section-heading">
                <span className="section-number">02</span>
                <h3 id="section-experience">Your experience</h3>
              </div>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="rating-question">Overall, how would you rate the conference? <span aria-hidden="true">*</span></legend>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div className="rating-option" key={rating}>
                      <input id={`rating-${rating}`} {...form.register('overallRating', { valueAsNumber: true })} type="radio" value={rating} required data-testid={`radio-rating-${rating}`} />
                      <label htmlFor={`rating-${rating}`}>
                        <span className="rating-num">{rating}</span>
                        <span className="rating-caption">{rating === 1 ? 'Not for me' : rating === 3 ? 'It was good' : rating === 5 ? 'Loved it' : '\u00a0'}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="rating-anchors"><span>1 — Needs work</span><span>5 — Excellent</span></div>
              </fieldset>
              <div className="field-grid" style={{ marginTop: 22 }}>
                <div className="field full">
                  <label htmlFor="mostValuable">What was most valuable to you? <span className="optional">(optional)</span></label>
                  <textarea id="mostValuable" {...form.register('mostValuable')} placeholder="A moment, conversation, resource, or idea that stayed with you…" data-testid="textarea-most-valuable" />
                </div>
                <div className="field full">
                  <label htmlFor="improvements">What could we improve for next time? <span className="optional">(optional)</span></label>
                  <textarea id="improvements" {...form.register('improvements')} placeholder="Your honest thoughts help us make this better." data-testid="textarea-improvements" />
                </div>
                <div className="field full">
                  <label htmlFor="futureTopics">What topics or support would you like at future events? <span className="optional">(optional)</span></label>
                  <textarea className="tall" id="futureTopics" {...form.register('futureTopics')} placeholder="Tell us what would be useful for you and your community." data-testid="textarea-future-topics" />
                </div>
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-stay-connected">
              <div className="section-heading">
                <span className="section-number">03</span>
                <h3 id="section-stay-connected">Stay connected, your way</h3>
              </div>
              <div className="choice-block">
                <span className="choice-title" id="contact-label">Would you like someone from our team to follow up with you?</span>
                <p className="choice-hint">A personal conversation about your feedback or support needs.</p>
                <div className="radio-row" role="radiogroup" aria-labelledby="contact-label">
                  {['yes', 'no'].map((answer) => (
                    <div className="radio-option" key={answer}>
                      <input id={`contact-${answer}`} {...form.register('contactRequested', { setValueAs: (value) => value === 'yes' })} type="radio" value={answer} data-testid={`radio-contact-${answer}`} />
                      <label htmlFor={`contact-${answer}`}>{answer === 'yes' ? 'Yes, please' : 'Not right now'}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="choice-block">
                <span className="choice-title" id="updates-label">Would you like updates about future Columbus Women Connect events?</span>
                <p className="choice-hint">We’ll only use your email for the updates you choose here.</p>
                <div className="radio-row" role="radiogroup" aria-labelledby="updates-label">
                  {['yes', 'no'].map((answer) => (
                    <div className="radio-option" key={answer}>
                      <input id={`updates-${answer}`} {...form.register('futureUpdates', { setValueAs: (value) => value === 'yes' })} type="radio" value={answer} data-testid={`radio-updates-${answer}`} />
                      <label htmlFor={`updates-${answer}`}>{answer === 'yes' ? 'Yes, keep me posted' : 'No, thank you'}</label>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="privacy-note" data-testid="text-privacy-note">
              <span className="privacy-mark" aria-hidden="true">i</span>
              <span>Your contact choices are yours. We’ll respect what you select and use your feedback to help shape future gatherings.</span>
            </div>

            {submitError && <p className="form-error" role="alert" data-testid="status-submit-error">{submitError}</p>}

            <div className="submit-row">
              <p className="submit-note">Your feedback helps the organizing team shape future gatherings.</p>
              <button className="submit-button" type="submit" disabled={createFeedback.isPending} data-testid="button-submit-feedback">
                {createFeedback.isPending ? 'Sending your feedback…' : 'Send my feedback'}
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
