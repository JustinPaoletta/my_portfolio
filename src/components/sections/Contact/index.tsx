/**
 * Contact Section
 * Contact form and social links
 * Uses Framer Motion for smooth scroll animations
 */

import { useRef, useState, type FormEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { env } from '@/config/env';
import {
  fadeUpVariants,
  fadeLeftVariants,
  fadeRightVariants,
  staggerContainerVariants,
  sectionHeaderVariants,
  defaultViewport,
} from '@/utils/animations';
import './Contact.css';

interface FormState {
  name: string;
  email: string;
  message: string;
}

function Contact(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, defaultViewport);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contact-section"
      aria-labelledby="contact-heading"
    >
      <div className="contact-background" aria-hidden="true">
        <div className="contact-gradient" />
      </div>

      <div className="section-container">
        <motion.header
          className="section-header"
          variants={sectionHeaderVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="section-label" variants={fadeUpVariants}>
            Contact
          </motion.span>
          <motion.h2
            id="contact-heading"
            className="section-title"
            variants={fadeUpVariants}
          >
            Get In Touch
          </motion.h2>
          <motion.p className="section-subtitle" variants={fadeUpVariants}>
            Have a project in mind or just want to chat? I&apos;d love to hear
            from you.
          </motion.p>
        </motion.header>

        <div className="contact-content">
          {/* Contact Info */}
          <motion.div
            className="contact-info"
            variants={fadeLeftVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <p className="contact-intro">
              I&apos;m always open to discussing new projects, creative ideas,
              or opportunities to be part of your vision. Feel free to reach out
              through any of these channels.
            </p>

            <motion.div
              className="contact-methods"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <motion.a
                href={`mailto:${env.social.email}`}
                className="contact-method"
                variants={fadeUpVariants}
              >
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                  </svg>
                </div>
                <div className="method-content">
                  <span className="method-label">Email</span>
                  <span className="method-value">{env.social.email}</span>
                </div>
              </motion.a>

              <motion.a
                href={env.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method"
                variants={fadeUpVariants}
              >
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <div className="method-content">
                  <span className="method-label">LinkedIn</span>
                  <span className="method-value">Let&apos;s connect</span>
                </div>
              </motion.a>

              <motion.a
                href={env.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method"
                variants={fadeUpVariants}
              >
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="method-content">
                  <span className="method-label">GitHub</span>
                  <span className="method-value">Check out my code</span>
                </div>
              </motion.a>
            </motion.div>

            <motion.div
              className="availability"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <div className="availability-indicator" aria-hidden="true">
                <span className="indicator-dot" />
              </div>
              <span className="availability-text">
                Currently available for freelance & full-time opportunities
              </span>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            className="contact-form"
            onSubmit={handleSubmit}
            variants={fadeRightVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="form-input form-textarea"
                placeholder="Tell me about your project..."
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <line
                      x1="22"
                      y1="2"
                      x2="11"
                      y2="13"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <polygon
                      points="22 2 15 22 11 13 2 9 22 2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>

            {submitStatus === 'success' && (
              <div className="form-success" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="22 4 12 14.01 9 11.01"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Message sent successfully! I&apos;ll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Failed to send message. Please try again or email me directly.
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
