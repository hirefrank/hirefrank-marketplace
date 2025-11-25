---
description: Interactive Resend email setup wizard. Configures transactional and marketing emails, React Email templates, and environment variables for Cloudflare Workers.
---

# Email Setup Command

<command_purpose> Guide developers through complete Resend email integration with automated code generation, React Email templates, domain configuration, and MCP-driven email setup. </command_purpose>

## Introduction

<role>Senior Email Integration Engineer with expertise in Resend, React Email, and Cloudflare Workers email delivery</role>

**This command will**:
- Detect project type (Tanstack Start or API-only Worker)
- Install Resend SDK and React Email dependencies
- Generate React Email template components
- Create email server functions for Tanstack Start
- Configure transactional email handlers (verification, password reset)
- Generate marketing email examples (newsletter)
- Set up domain verification configuration
- Configure environment variables and secrets
- Add error handling and retry logic with D1

## Prerequisites

<requirements>
- Cloudflare Workers project (Tanstack Start or Hono)
- Resend account: https://resend.com (free tier available)
- API key from Resend dashboard
- D1 database configured for email retry tracking (optional)
</requirements>

## Main Tasks

### 1. Detect Project Type & Email Requirements

**Ask User**:
```markdown
📧 Email Setup Wizard

1. What project type are you using?
   a) Tanstack Start (full-stack)
   b) Standalone Worker (Hono/plain TS)

2. What email flows do you need?
   a) Transactional only (verification, password reset)
   b) Marketing only (newsletters, announcements)
   c) Both transactional and marketing
   d) Custom email patterns
```

**Decision Logic**:
```
If Tanstack Start + Any type:
  → Use createServerFn for email handlers
  → Generate React Email templates
  → Use @react-email/components

If Standalone Worker:
  → Use Worker handlers
  → Generate React Email templates
  → Use @react-email/components
```

### 2. Install Dependencies

**For Tanstack Start**:
```bash
npm install resend @react-email/components @react-email/render
npm install -D @types/react @types/react-dom
```

**For Standalone Worker**:
```bash
npm install resend @react-email/components @react-email/render
npm install -D @types/react @types/react-dom
```

**React Email Setup**:
```bash
# Add React Email CLI (optional, for preview server)
npm install -D react-email
```

### 3. Generate React Email Templates

#### Template: Email Verification

**Generate File**: `emails/verify-email.tsx`

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VerifyEmailProps {
  verificationUrl: string;
  email: string;
}

const baseUrl = process.env.RESEND_BASE_URL || 'https://example.com';

export function VerifyEmail({ verificationUrl, email }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>Verify your email</Heading>
            <Text style={paragraph}>
              Thanks for signing up! Please verify your email address to complete your registration.
            </Text>
            <Button style={button} href={verificationUrl}>
              Verify Email
            </Button>
            <Text style={paragraph}>
              Or copy and paste this link:
            </Text>
            <Link style={link} href={verificationUrl}>
              {verificationUrl}
            </Link>
            <Text style={paragraph}>
              This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
            </Text>
          </Section>
          <Text style={footer}>
            © 2025 Your Company. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen-Sans",Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '16px 0',
};

const link = {
  color: '#0000ee',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '16px 0',
};
```

#### Template: Password Reset

**Generate File**: `emails/password-reset.tsx`

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PasswordResetProps {
  resetUrl: string;
  email: string;
}

export function PasswordReset({ resetUrl, email }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>Reset your password</Heading>
            <Text style={paragraph}>
              We received a request to reset your password. Click the button below to create a new password.
            </Text>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
            <Text style={paragraph}>
              Or copy and paste this link:
            </Text>
            <Link style={link} href={resetUrl}>
              {resetUrl}
            </Link>
            <Text style={paragraph}>
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </Text>
            <Text style={hint}>
              For security, never share this link with anyone.
            </Text>
          </Section>
          <Text style={footer}>
            © 2025 Your Company. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (same as VerifyEmail)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen-Sans",Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const hint = {
  color: '#f59e0b',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '16px 0',
};

const link = {
  color: '#0000ee',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '16px 0',
};
```

#### Template: Newsletter

**Generate File**: `emails/newsletter.tsx`

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewsletterProps {
  month: string;
  articles: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  unsubscribeUrl: string;
}

export function Newsletter({ month, articles, unsubscribeUrl }: NewsletterProps) {
  return (
    <Html>
      <Head />
      <Preview>{month} Newsletter - Latest updates</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>{month} Newsletter</Heading>
            <Text style={subtitle}>Your monthly roundup of updates and insights</Text>
          </Section>

          {articles.map((article, index) => (
            <Section key={index} style={articleSection}>
              <Heading style={articleHeading}>{article.title}</Heading>
              <Text style={paragraph}>{article.description}</Text>
              <Button style={button} href={article.url}>
                Read More
              </Button>
            </Section>
          ))}

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Your Company. All rights reserved.
            </Text>
            <Link style={unsubscribeLink} href={unsubscribeUrl}>
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen-Sans",Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '48px 0',
  marginBottom: '64px',
};

const header = {
  backgroundColor: '#000000',
  padding: '32px 48px',
};

const heading = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
};

const subtitle = {
  color: '#cccccc',
  fontSize: '16px',
  margin: '8px 0 0 0',
};

const articleSection = {
  padding: '32px 48px',
  borderBottom: '1px solid #e5e7eb',
};

const articleHeading = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  margin: '16px 0',
};

const footer = {
  padding: '32px 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0 0 16px 0',
};

const unsubscribeLink = {
  color: '#8898aa',
  fontSize: '12px',
  textDecoration: 'underline',
};
```

### 4. Generate Email Server Functions (Tanstack Start)

**Generate File**: `server/emails/send-verify-email.ts`

```typescript
import { createServerFn } from '@tanstack/start';
import { Resend } from 'resend';
import { VerifyEmail } from '@/emails/verify-email';

interface SendVerifyEmailInput {
  to: string;
  verificationUrl: string;
}

export const sendVerifyEmail = createServerFn(
  'POST',
  async (input: SendVerifyEmailInput, context) => {
    const { env } = context.cloudflare;
    const resend = new Resend(env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: input.to,
        subject: 'Verify your email address',
        react: VerifyEmail({
          verificationUrl: input.verificationUrl,
          email: input.to,
        }),
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      // Log sent email for audit trail
      if (env.DB) {
        await env.DB.prepare(
          `INSERT INTO sent_emails (id, to, subject, type, email_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          input.to,
          'Verify your email address',
          'verification',
          data.id,
          new Date().toISOString()
        ).run();
      }

      return { success: true, emailId: data.id };
    } catch (error) {
      console.error('Email send error:', error);

      // Store failed email for retry
      if (env.DB) {
        await env.DB.prepare(
          `INSERT INTO failed_emails (id, to, subject, type, error, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          input.to,
          'Verify your email address',
          'verification',
          error instanceof Error ? error.message : 'Unknown error',
          new Date().toISOString()
        ).run();
      }

      return {
        success: false,
        error: 'Email delivery failed. Please try again later.',
      };
    }
  }
);
```

**Generate File**: `server/emails/send-password-reset.ts`

```typescript
import { createServerFn } from '@tanstack/start';
import { Resend } from 'resend';
import { PasswordReset } from '@/emails/password-reset';

interface SendPasswordResetInput {
  to: string;
  resetUrl: string;
}

export const sendPasswordReset = createServerFn(
  'POST',
  async (input: SendPasswordResetInput, context) => {
    const { env } = context.cloudflare;
    const resend = new Resend(env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: input.to,
        subject: 'Reset your password',
        react: PasswordReset({
          resetUrl: input.resetUrl,
          email: input.to,
        }),
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      // Log sent email
      if (env.DB) {
        await env.DB.prepare(
          `INSERT INTO sent_emails (id, to, subject, type, email_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          input.to,
          'Reset your password',
          'password_reset',
          data.id,
          new Date().toISOString()
        ).run();
      }

      return { success: true, emailId: data.id };
    } catch (error) {
      console.error('Email send error:', error);

      // Store failed email for retry
      if (env.DB) {
        await env.DB.prepare(
          `INSERT INTO failed_emails (id, to, subject, type, error, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          input.to,
          'Reset your password',
          'password_reset',
          error instanceof Error ? error.message : 'Unknown error',
          new Date().toISOString()
        ).run();
      }

      return {
        success: false,
        error: 'Email delivery failed. Please try again later.',
      };
    }
  }
);
```

**Generate File**: `server/emails/send-newsletter.ts`

```typescript
import { createServerFn } from '@tanstack/start';
import { Resend } from 'resend';
import { Newsletter } from '@/emails/newsletter';

interface NewsletterArticle {
  title: string;
  description: string;
  url: string;
}

interface SendNewsletterInput {
  to: string[];
  month: string;
  articles: NewsletterArticle[];
  unsubscribeBaseUrl: string;
}

export const sendNewsletter = createServerFn(
  'POST',
  async (input: SendNewsletterInput, context) => {
    const { env } = context.cloudflare;
    const resend = new Resend(env.RESEND_API_KEY);

    try {
      // Batch send using Resend's batch API
      const batch = input.to.map(email => ({
        from: 'newsletter@yourdomain.com',
        to: email,
        subject: `${input.month} Newsletter - Latest updates`,
        react: Newsletter({
          month: input.month,
          articles: input.articles,
          unsubscribeUrl: `${input.unsubscribeBaseUrl}?email=${encodeURIComponent(email)}`,
        }),
      }));

      const { data, error } = await resend.batch.send(batch);

      if (error) {
        console.error('Batch send error:', error);
        throw new Error(`Failed to send newsletters: ${error.message}`);
      }

      // Log sent emails
      if (env.DB) {
        for (const email of input.to) {
          await env.DB.prepare(
            `INSERT INTO sent_emails (id, to, subject, type, email_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(
            crypto.randomUUID(),
            email,
            `${input.month} Newsletter`,
            'newsletter',
            data?.id || 'batch',
            new Date().toISOString()
          ).run();
        }
      }

      return {
        success: true,
        sent: input.to.length,
        batchId: data?.id,
      };
    } catch (error) {
      console.error('Newsletter send error:', error);

      // Store failed batch
      if (env.DB) {
        for (const email of input.to) {
          await env.DB.prepare(
            `INSERT INTO failed_emails (id, to, subject, type, error, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(
            crypto.randomUUID(),
            email,
            `${input.month} Newsletter`,
            'newsletter',
            error instanceof Error ? error.message : 'Unknown error',
            new Date().toISOString()
          ).run();
        }
      }

      return {
        success: false,
        error: 'Newsletter delivery failed. Please try again later.',
      };
    }
  }
);
```

### 5. Generate Database Migration for Email Tracking

**Generate File**: `migrations/0001_email_tracking.sql`

```sql
-- Sent emails log (audit trail)
CREATE TABLE sent_emails (
  id TEXT PRIMARY KEY,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL, -- 'verification', 'password_reset', 'newsletter', 'custom'
  email_id TEXT UNIQUE, -- Resend email ID for tracking
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Failed emails for retry logic
CREATE TABLE failed_emails (
  id TEXT PRIMARY KEY,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TEXT,
  created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_sent_emails_to ON sent_emails(to);
CREATE INDEX idx_sent_emails_type ON sent_emails(type);
CREATE INDEX idx_sent_emails_created ON sent_emails(created_at);
CREATE INDEX idx_failed_emails_to ON failed_emails(to);
CREATE INDEX idx_failed_emails_type ON failed_emails(type);
CREATE INDEX idx_failed_emails_retry_count ON failed_emails(retry_count);
```

**Run Migration**:
```bash
wrangler d1 migrations apply DB --local
wrangler d1 migrations apply DB --remote
```

### 6. Configure Environment Variables

**Update**: `wrangler.toml`

```toml
# Add Resend API key binding
[env.production.vars]
# RESEND_API_KEY should be set as a secret, not in this file

# D1 database binding (if using email tracking)
[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "..."  # Get from: wrangler d1 create my-app-db
```

**Create**: `.dev.vars` (local development)

```bash
# Resend API Key (sensitive - DO NOT COMMIT)
RESEND_API_KEY=re_your_api_key_here

# Your domain for email sender (update to your domain)
# RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Production Setup**:
```bash
# Set Resend API key as a secret
wrangler secret put RESEND_API_KEY
# Paste: re_xxxxxxxxxxxxx
```

### 7. Configure Domain Verification

**Instructions for User**:

```markdown
## Setup Custom Email Domain (Required for Production)

### Step 1: Add Domain in Resend
1. Go to https://resend.com/dashboard/domains
2. Click "Add Domain"
3. Enter your domain (e.g., yourdomain.com)
4. Resend will show DNS records to add

### Step 2: Add DNS Records
Add these records to your domain's DNS provider (Cloudflare, Route53, etc.):

**SPF Record**:
```
Type: TXT
Name: yourdomain.com
Value: v=spf1 include:resend.com ~all
```

**DKIM Record**:
```
Type: CNAME
Name: default._domainkey.yourdomain.com
Value: [value from Resend dashboard]
```

**DMARC Record** (optional but recommended):
```
Type: TXT
Name: _dmarc.yourdomain.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### Step 3: Verify Domain
1. Return to Resend dashboard
2. Click "Verify Domain"
3. Wait for DNS propagation (usually 5-30 minutes)
4. Once verified, use `from: 'noreply@yourdomain.com'` in emails

### Step 4: Update Email Templates
Replace `noreply@yourdomain.com` with your verified domain across all email functions.

### Development
For development/testing only, use:
```
from: 'onboarding@resend.dev'
```
This works without domain verification but is limited to emails you've verified with Resend.
```

### 8. Setup Email Retry Logic

**Generate File**: `server/utils/email-retry.ts`

```typescript
import { Resend } from 'resend';

interface Env {
  RESEND_API_KEY: string;
  DB: D1Database;
}

export async function retryFailedEmails(env: Env) {
  const resend = new Resend(env.RESEND_API_KEY);

  // Get failed emails that haven't exceeded retry limit
  const failed = await env.DB.prepare(
    `SELECT * FROM failed_emails
     WHERE retry_count < 3
     AND (last_retry_at IS NULL OR datetime(last_retry_at) < datetime('now', '-1 hour'))
     LIMIT 10`
  ).all();

  if (!failed.results || failed.results.length === 0) {
    console.log('No emails to retry');
    return { retried: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let retryFailed = 0;

  for (const email of failed.results) {
    try {
      // Reconstruct and resend based on type
      // This is a simplified version - you may need to store template data
      const { error } = await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: email.to,
        subject: email.subject,
        html: `<p>Retry: ${email.subject}</p>`,
      });

      if (error) {
        // Increment retry count and update last_retry_at
        await env.DB.prepare(
          `UPDATE failed_emails
           SET retry_count = retry_count + 1,
               last_retry_at = ?
           WHERE id = ?`
        ).bind(new Date().toISOString(), email.id).run();

        retryFailed++;
      } else {
        // Move to sent_emails and remove from failed_emails
        await env.DB.prepare(
          `DELETE FROM failed_emails WHERE id = ?`
        ).bind(email.id).run();

        succeeded++;
      }
    } catch (error) {
      console.error('Retry error for email:', email.id, error);
      retryFailed++;
    }
  }

  return {
    retried: failed.results.length,
    succeeded,
    failed: retryFailed,
  };
}
```

**Setup Scheduled Retry** (using Cloudflare Cron):

Update `wrangler.toml`:
```toml
[[triggers.crons]]
crons = ["0 */6 * * *"]  # Run every 6 hours
```

Create `src/scheduled.ts`:
```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const result = await retryFailedEmails(env);
        console.log('Email retry results:', result);
      })()
    );
  },
};
```

### 9. Integrate with Authentication

**Example: Send verification email on signup**

Update `server/routes/auth/register.ts`:
```typescript
import { sendVerifyEmail } from '@/server/emails/send-verify-email';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  // Create user...
  const user = await createUser(email, password, event.context.cloudflare.env.DB);

  // Generate verification token
  const token = generateToken(user.id);

  // Send verification email
  const verifyUrl = `${process.env.PUBLIC_URL}/verify?token=${token}`;
  await sendVerifyEmail({
    to: email,
    verificationUrl: verifyUrl,
  });

  return {
    success: true,
    message: 'Account created. Please check your email to verify.',
  };
});
```

**Example: Send password reset email**

Create `server/routes/auth/forgot-password.ts`:
```typescript
import { sendPasswordReset } from '@/server/emails/send-password-reset';

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);

  // Find user
  const user = await findUserByEmail(email, event.context.cloudflare.env.DB);

  if (!user) {
    // Don't reveal if email exists (security)
    return {
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    };
  }

  // Generate reset token
  const token = generateToken(user.id, '1h');

  // Send password reset email
  const resetUrl = `${process.env.PUBLIC_URL}/reset-password?token=${token}`;
  await sendPasswordReset({
    to: email,
    resetUrl,
  });

  return {
    success: true,
    message: 'Password reset email sent.',
  };
});
```

### 10. Setup Email Analytics Webhook (Optional)

**Resend Webhook Configuration**:

1. Go to https://resend.com/dashboard/settings/webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/email`
3. Subscribe to events:
   - `email.sent`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`

**Create Handler**: `server/api/webhooks/email.ts`

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { type, data } = body;

  try {
    switch (type) {
      case 'email.sent':
        await updateEmailStatus(data.email_id, 'sent', event.context.cloudflare.env.DB);
        break;

      case 'email.opened':
        await updateEmailStatus(data.email_id, 'opened', event.context.cloudflare.env.DB);
        break;

      case 'email.clicked':
        await updateEmailStatus(data.email_id, 'clicked', event.context.cloudflare.env.DB);
        break;

      case 'email.bounced':
        await handleBounce(data.email_id, data.email, event.context.cloudflare.env.DB);
        break;

      default:
        console.log('Unknown email event:', type);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return { success: false, error: String(error) };
  }
});

async function updateEmailStatus(emailId: string, status: string, db: D1Database) {
  await db.prepare(
    `UPDATE sent_emails SET ${status} = 1, updated_at = ? WHERE email_id = ?`
  ).bind(new Date().toISOString(), emailId).run();
}

async function handleBounce(emailId: string, email: string, db: D1Database) {
  await db.prepare(
    `UPDATE sent_emails SET bounced = 1, updated_at = ? WHERE email_id = ?`
  ).bind(new Date().toISOString(), emailId).run();

  // Optionally mark email as invalid for future use
  // await db.prepare(
  //   `INSERT INTO invalid_emails (email) VALUES (?) ON CONFLICT DO NOTHING`
  // ).bind(email).run();
}
```

### 11. Testing Email Flows

**Test Email Sending**:
```typescript
// Use Resend's test address
const { data, error } = await resend.emails.send({
  from: 'test@yourdomain.com',
  to: 'test@resend.dev', // Special test address
  subject: 'Test email',
  react: VerifyEmail({
    verificationUrl: 'https://example.com/verify?token=test',
    email: 'test@resend.dev',
  }),
});
```

**Playwright E2E Test Example**:
```typescript
test('sends verification email on signup', async ({ page }) => {
  await page.goto('/signup');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test123!@#');
  await page.click('button[type="submit"]');

  // Verify success message
  await expect(page.locator('[data-testid="success-message"]'))
    .toContainText('Check your email');

  // In real scenario, verify email was sent via Resend API
  // This test verifies the UI flow, not actual email delivery
});
```

**Preview React Email Templates**:
```bash
# Start React Email preview server
npm run email:preview

# Open http://localhost:3000 to preview templates
```

## Success Criteria

✅ Email setup complete when:
- Resend SDK and React Email dependencies installed
- All email templates generated (verification, password reset, newsletter)
- Server functions created for sending emails
- Database migration for email tracking
- Environment variables configured
- Domain verification setup (at least documented)
- Error handling and retry logic implemented
- Integration with auth flows completed
- Email previews working
- Testing strategy documented

## Output Summary

**Files Created**:
- Email templates:
  - `emails/verify-email.tsx`
  - `emails/password-reset.tsx`
  - `emails/newsletter.tsx`
- Server functions:
  - `server/emails/send-verify-email.ts`
  - `server/emails/send-password-reset.ts`
  - `server/emails/send-newsletter.ts`
- Database migration: `migrations/0001_email_tracking.sql`
- Utilities: `server/utils/email-retry.ts`
- Webhook handler: `server/api/webhooks/email.ts`
- Scheduled job: `src/scheduled.ts`

**Files Updated**:
- `wrangler.toml` (Resend vars, D1 binding)
- `.dev.vars` (template)

**Next Actions**:
1. Install dependencies: `npm install resend @react-email/components`
2. Run database migration: `wrangler d1 migrations apply DB`
3. Generate Resend API key: https://resend.com/dashboard
4. Add to secrets: `wrangler secret put RESEND_API_KEY`
5. Configure domain in Resend dashboard
6. Test email flows with signup
7. Preview templates: `npm run email:preview`
8. Deploy with `/es-deploy`

## Notes

- Always use Resend for transactional and marketing emails
- React Email provides type-safe, component-based templates
- Store RESEND_API_KEY as Cloudflare secret (not in wrangler.toml)
- Domain verification required for production (use onboarding@resend.dev for testing)
- Email retry logic handles transient failures
- Track email opens/clicks via Resend webhooks
- Test with onboarding@resend.dev before using custom domain
- Use batch API for newsletters to multiple recipients
- See `agents/integrations/resend-email-specialist` for detailed guidance
