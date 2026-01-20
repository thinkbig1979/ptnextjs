'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send } from 'lucide-react';

interface ContactFormProps {
  email: string;
}

const TOPICS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'discovery', label: 'Discovery Platform' },
  { value: 'lighting', label: 'Custom Lighting' },
  { value: 'consultancy', label: 'Consultancy Services' },
  { value: 'partnership', label: 'Partnership Opportunities' },
] as const;

/**
 * ContactForm Component
 *
 * A contact form with topic selector, name, email, company, and message fields.
 * Submits via mailto link to preserve simplicity and avoid server-side dependencies.
 */
export function ContactForm({ email }: ContactFormProps) {
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (value: string) => {
    setFormData((prev) => ({ ...prev, topic: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Find the topic label for the subject line
    const topicLabel =
      TOPICS.find((t) => t.value === formData.topic)?.label || 'General Inquiry';

    // Build the email subject
    const subject = `[Paul Thames Website] ${topicLabel}`;

    // Build the email body with formatted content
    const body = `
Name: ${formData.name}
Email: ${formData.email}
${formData.company ? `Company: ${formData.company}\n` : ''}
Topic: ${topicLabel}

Message:
${formData.message}
`.trim();

    // Create mailto link with encoded parameters
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mailto link
    window.location.href = mailtoLink;
  };

  const isFormValid =
    formData.topic && formData.name && formData.email && formData.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic Selector */}
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Select value={formData.topic} onValueChange={handleTopicChange}>
          <SelectTrigger id="topic" aria-label="Select a topic">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((topic) => (
              <SelectItem key={topic.value} value={topic.value}>
                {topic.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
            aria-label="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            aria-label="Your email address"
          />
        </div>
      </div>

      {/* Company Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          type="text"
          placeholder="Your company name"
          value={formData.company}
          onChange={handleInputChange}
          aria-label="Your company name"
        />
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="How can we help you?"
          value={formData.message}
          onChange={handleInputChange}
          required
          aria-label="Your message"
          className="min-h-[150px] resize-y"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={!isFormValid}
        aria-label="Send message"
      >
        <Send className="mr-2 h-4 w-4" />
        Send Message
      </Button>

      <p className="text-sm text-muted-foreground text-center font-poppins-light">
        This will open your email client with a pre-filled message.
      </p>
    </form>
  );
}
