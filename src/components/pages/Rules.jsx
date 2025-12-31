import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, Heart, BookOpen, HelpCircle, FileText, Scale, Check, X, AlertTriangle, Volume2, Image, Video, Music } from 'lucide-react';
import { Glass } from '../ui/primitives';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING } from '../layout/Nav';
import { C } from '../../lib/constants';

const PageWrapper = ({ children, title, onBack }) => (
  <div style={{
    paddingBottom: SAFE_BOTTOM_PADDING,
    paddingTop: SAFE_TOP_PADDING,
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: '100vh'
  }}>
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 10,
            minWidth: 44,
            minHeight: 44,
            cursor: 'pointer',
            color: C.muted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 300, color: C.text, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const Section = ({ title, children, icon: Icon }) => (
  <div style={{ marginBottom: 32 }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {Icon && <Icon size={18} color={C.emeraldLight} />}
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: C.text }}>{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const Paragraph = ({ children }) => (
  <p style={{
    margin: '0 0 16px',
    color: C.textSecondary,
    lineHeight: 1.7,
    fontSize: 15,
    maxWidth: 580
  }}>
    {children}
  </p>
);

const RuleItem = ({ text, reason, allowed }) => (
  <div style={{
    padding: '16px 18px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    marginBottom: 12,
    border: `1px solid ${C.border}`
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: allowed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2
      }}>
        {allowed ? <Check size={14} color={C.emeraldLight} /> : <X size={14} color="#fca5a5" />}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 15, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>{text}</p>
        {reason && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            {reason}
          </p>
        )}
      </div>
    </div>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <Glass style={{ marginBottom: 12 }}>
    <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 500, color: C.text, lineHeight: 1.5 }}>{question}</p>
    <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{answer}</p>
  </Glass>
);

const NavItem = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      cursor: 'pointer',
      marginBottom: 10,
      WebkitTapHighlightColor: 'transparent'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Icon size={20} color={C.emeraldLight} />
      <span style={{ fontSize: 15, color: C.text, fontWeight: 400 }}>{label}</span>
    </div>
    <ChevronRight size={18} color={C.muted} />
  </button>
);

const SafeZonePrinciples = ({ onBack }) => (
  <PageWrapper title="SafeZone Principles" onBack={onBack}>
    <Glass style={{ marginBottom: 24, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Shield size={20} color={C.emeraldLight} />
        <span style={{ fontSize: 14, fontWeight: 500, color: C.emeraldLight }}>Our Foundation</span>
      </div>
      <Paragraph>
        Sanctra is built on the belief that digital spaces can be calm, honest, and human. These principles guide every decision we make.
      </Paragraph>
    </Glass>

    <Section title="No Algorithmic Manipulation">
      <Paragraph>
        We do not use algorithms to decide what you see. Your feed shows content in the order it was posted. No content is hidden, boosted, or suppressed to keep you engaged longer.
      </Paragraph>
    </Section>

    <Section title="No Rage-Bait Amplification">
      <Paragraph>
        We do not reward content that provokes anger or outrage. Engagement metrics do not determine visibility. Your attention is not a resource to be extracted.
      </Paragraph>
    </Section>

    <Section title="Chronological Feed">
      <Paragraph>
        Content appears in the order it was created. No machine decides what matters to you. You see what you follow, when it happens.
      </Paragraph>
    </Section>

    <Section title="User Control">
      <Paragraph>
        You control your sound, your media, your visibility. Nothing autoplays with audio. You decide what you share and who sees it.
      </Paragraph>
    </Section>

    <Section title="Emotional Safety Over Engagement">
      <Paragraph>
        We measure success by how safe you feel, not how long you stay. We will never sacrifice your wellbeing for metrics.
      </Paragraph>
    </Section>

    <Section title="Silence Is Allowed">
      <Paragraph>
        There is no pressure to post, comment, or react. You can observe, reflect, or simply be present. Your value here is not measured by your output.
      </Paragraph>
    </Section>
  </PageWrapper>
);

const CommunityRules = ({ onBack }) => (
  <PageWrapper title="Community Rules" onBack={onBack}>
    <Paragraph>
      These rules exist to keep Sanctra safe for everyone. They are enforced consistently and fairly.
    </Paragraph>

    <Section>
      <RuleItem
        text="No harassment, hate speech, or threats"
        reason="Everyone deserves to feel safe. Targeting individuals or groups based on identity, beliefs, or circumstances is not tolerated."
        allowed={false}
      />
      <RuleItem
        text="No impersonation"
        reason="Trust requires authenticity. Pretending to be someone else undermines the foundation of genuine connection."
        allowed={false}
      />
      <RuleItem
        text="No explicit sexual content"
        reason="Sanctra is a space for emotional expression, not adult content. This keeps the space accessible to all."
        allowed={false}
      />
      <RuleItem
        text="No graphic violence"
        reason="Disturbing imagery harms those who encounter it unexpectedly. We prioritize emotional safety."
        allowed={false}
      />
      <RuleItem
        text="No spam or growth hacking"
        reason="Authentic connection cannot be manufactured. Artificial engagement tactics pollute the space for everyone."
        allowed={false}
      />
      <RuleItem
        text="No stolen content"
        reason="Creators deserve credit for their work. Sharing others' work without attribution or permission is theft."
        allowed={false}
      />
      <RuleItem
        text="Respect emotional vulnerability"
        reason="People share difficult feelings here. Mocking, dismissing, or exploiting vulnerability causes real harm."
        allowed={false}
      />
    </Section>

    <Glass style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <AlertTriangle size={18} color={C.accentLight} />
        <span style={{ fontSize: 14, fontWeight: 500, color: C.accentLight }}>Enforcement</span>
      </div>
      <Paragraph style={{ marginBottom: 0 }}>
        Violations may result in content removal, temporary restrictions, or permanent removal from the platform. We review reports carefully and prioritize context.
      </Paragraph>
    </Glass>
  </PageWrapper>
);

const CreatorGuidelines = ({ onBack }) => (
  <PageWrapper title="Creator Guidelines" onBack={onBack}>
    <Paragraph>
      Creators shape the culture of Sanctra. These guidelines help you share meaningfully while respecting the community.
    </Paragraph>

    <Section title="What Belongs Here" icon={Check}>
      <RuleItem text="Personal thoughts and reflections" allowed={true} />
      <RuleItem text="Original art and creative work" allowed={true} />
      <RuleItem text="Calm, ambient videos" allowed={true} />
      <RuleItem text="Sound pieces and audio expressions" allowed={true} />
      <RuleItem text="Honest emotional sharing" allowed={true} />
      <RuleItem text="Constructive conversations" allowed={true} />
    </Section>

    <Section title="What Does Not Belong Here" icon={X}>
      <RuleItem text="Shock content designed to provoke" allowed={false} />
      <RuleItem text="Manipulative or misleading content" allowed={false} />
      <RuleItem text="Misinformation or harmful falsehoods" allowed={false} />
      <RuleItem text="Content optimized for viral spread" allowed={false} />
      <RuleItem text="Engagement bait or click farming" allowed={false} />
    </Section>

    <Section title="Media Limits" icon={Image}>
      <Glass>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image size={18} color={C.muted} />
            <div>
              <p style={{ margin: 0, fontSize: 14, color: C.text }}>Images</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>1 per post, 5MB max</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Video size={18} color={C.muted} />
            <div>
              <p style={{ margin: 0, fontSize: 14, color: C.text }}>Video</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>10 seconds max, 15MB max</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Music size={18} color={C.muted} />
            <div>
              <p style={{ margin: 0, fontSize: 14, color: C.text }}>Sound</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>15 seconds max, 5MB max</p>
            </div>
          </div>
        </div>
      </Glass>
    </Section>

    <Section title="Copyright">
      <Paragraph>
        Only share content you created or have permission to use. Respect the intellectual property of others. If you use samples, loops, or references, ensure you have the rights to do so.
      </Paragraph>
    </Section>

    <Section title="Ownership">
      <Paragraph>
        You own your content. Sanctra does not claim ownership of anything you create. You can download, delete, or move your work at any time.
      </Paragraph>
    </Section>
  </PageWrapper>
);

const FAQ = ({ onBack }) => (
  <PageWrapper title="Frequently Asked Questions" onBack={onBack}>
    <FAQItem
      question="Is Sanctra algorithm-free?"
      answer="Yes. Content is displayed chronologically. We do not use machine learning to curate, rank, or filter your feed."
    />
    <FAQItem
      question="Is this social media?"
      answer="Sanctra is a SafeZone for expression, not competition. There are no follower counts displayed publicly, no viral mechanics, and no pressure to perform. It is social, but designed for connection rather than metrics."
    />
    <FAQItem
      question="What is CTY?"
      answer="CTY is a utility credit used inside the platform. It is not a cryptocurrency, investment, or financial asset. CTY can be used to unlock features and support creators within Sanctra."
    />
    <FAQItem
      question="Can I download my content?"
      answer="Yes. Your content belongs to you. You can download any media you have uploaded at any time. We believe in data portability and user ownership."
    />
    <FAQItem
      question="Is AI generation available?"
      answer="Not yet. We are developing AI tools carefully and thoughtfully. When enabled, AI features will be clearly labeled and optional. We will not use AI in ways that deceive or manipulate."
    />
    <FAQItem
      question="How do I report content?"
      answer="Every post and profile has a report option. Tap the menu icon and select Report. You can choose a category and add details. Reports are reviewed by humans, not algorithms."
    />
    <FAQItem
      question="What happens when I report something?"
      answer="Our team reviews reports carefully, considering context. We do not publicly shame or announce moderation actions. Reporters remain anonymous to the reported party."
    />
    <FAQItem
      question="Can I block or mute users?"
      answer="Yes. You can block any user to prevent them from seeing your content or contacting you. You can also mute users to hide their content without blocking them."
    />
    <FAQItem
      question="Is my data sold to advertisers?"
      answer="No. We do not sell your data. We do not serve targeted advertising. Your information is not a product."
    />
    <FAQItem
      question="How does Sanctra make money?"
      answer="Through optional premium features and creator support transactions. We believe in honest business models that align our interests with yours."
    />
  </PageWrapper>
);

const PrivacyPolicy = ({ onBack }) => (
  <PageWrapper title="Privacy Policy" onBack={onBack}>
    <Glass style={{ marginBottom: 24 }}>
      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Last updated: December 2024</p>
    </Glass>

    <Section title="What We Collect">
      <Paragraph>
        We collect the minimum information necessary to provide our service: your email address for account access, content you choose to post, and basic usage data to maintain platform stability.
      </Paragraph>
    </Section>

    <Section title="What We Do Not Collect">
      <Paragraph>
        We do not track your behavior across other websites. We do not build advertising profiles. We do not sell or share your personal information with third parties for marketing purposes.
      </Paragraph>
    </Section>

    <Section title="How We Use Your Information">
      <Paragraph>
        Your information is used to: provide and improve our service, communicate with you about your account, ensure platform safety through moderation, and process payments if you make purchases.
      </Paragraph>
    </Section>

    <Section title="Data Storage">
      <Paragraph>
        Your data is stored securely using industry-standard encryption. We use Supabase for database services, which provides enterprise-grade security and compliance.
      </Paragraph>
    </Section>

    <Section title="Your Rights">
      <Paragraph>
        You can request a copy of your data at any time. You can delete your account and all associated data. You can update or correct your information through your profile settings.
      </Paragraph>
    </Section>

    <Section title="Contact">
      <Paragraph>
        For privacy questions or data requests, contact us through the app or at privacy@sanctra.app
      </Paragraph>
    </Section>
  </PageWrapper>
);

const TermsOfService = ({ onBack }) => (
  <PageWrapper title="Terms of Service" onBack={onBack}>
    <Glass style={{ marginBottom: 24 }}>
      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Last updated: December 2024</p>
    </Glass>

    <Section title="Acceptance">
      <Paragraph>
        By using Sanctra, you agree to these terms. If you disagree with any part, please do not use our service. We may update these terms, and continued use constitutes acceptance.
      </Paragraph>
    </Section>

    <Section title="Your Account">
      <Paragraph>
        You are responsible for maintaining the security of your account. You must provide accurate information. You must not share your account with others or create multiple accounts to circumvent restrictions.
      </Paragraph>
    </Section>

    <Section title="Your Content">
      <Paragraph>
        You retain ownership of content you create. By posting, you grant Sanctra a license to display and distribute your content within the platform. You may delete your content at any time.
      </Paragraph>
    </Section>

    <Section title="Prohibited Uses">
      <Paragraph>
        You may not use Sanctra to violate laws, infringe on others rights, spread malware, attempt unauthorized access, or engage in any activity that harms the platform or its users.
      </Paragraph>
    </Section>

    <Section title="CTY Credits">
      <Paragraph>
        CTY is a platform utility credit with no cash value outside Sanctra. CTY cannot be exchanged for currency. Unused CTY may expire according to our policies. CTY is not a security or investment.
      </Paragraph>
    </Section>

    <Section title="Termination">
      <Paragraph>
        We may suspend or terminate accounts that violate these terms or our community rules. You may delete your account at any time. Upon termination, your right to use the service ends immediately.
      </Paragraph>
    </Section>

    <Section title="Limitation of Liability">
      <Paragraph>
        Sanctra is provided as-is. We do not guarantee uninterrupted service. We are not liable for content posted by users. Our liability is limited to the amount you have paid us in the past 12 months.
      </Paragraph>
    </Section>

    <Section title="Governing Law">
      <Paragraph>
        These terms are governed by applicable law. Disputes will be resolved through binding arbitration rather than court proceedings, except where prohibited by law.
      </Paragraph>
    </Section>
  </PageWrapper>
);

const TrustIndex = ({ onNavigate, onBack }) => (
  <PageWrapper title="Trust & Safety" onBack={onBack}>
    <Paragraph>
      Sanctra is built on transparency and respect. These documents explain how we operate and what we expect from our community.
    </Paragraph>

    <div style={{ marginTop: 24 }}>
      <NavItem icon={Shield} label="SafeZone Principles" onClick={() => onNavigate('principles')} />
      <NavItem icon={Heart} label="Community Rules" onClick={() => onNavigate('community')} />
      <NavItem icon={BookOpen} label="Creator Guidelines" onClick={() => onNavigate('creators')} />
      <NavItem icon={HelpCircle} label="FAQ" onClick={() => onNavigate('faq')} />
      <NavItem icon={FileText} label="Privacy Policy" onClick={() => onNavigate('privacy')} />
      <NavItem icon={Scale} label="Terms of Service" onClick={() => onNavigate('terms')} />
    </div>
  </PageWrapper>
);

export const Rules = ({ onBack, initialPage }) => {
  const [page, setPage] = useState(initialPage || 'index');

  const handleBack = () => {
    if (page === 'index') {
      onBack();
    } else {
      setPage('index');
    }
  };

  switch (page) {
    case 'principles':
      return <SafeZonePrinciples onBack={handleBack} />;
    case 'community':
      return <CommunityRules onBack={handleBack} />;
    case 'creators':
      return <CreatorGuidelines onBack={handleBack} />;
    case 'faq':
      return <FAQ onBack={handleBack} />;
    case 'privacy':
      return <PrivacyPolicy onBack={handleBack} />;
    case 'terms':
      return <TermsOfService onBack={handleBack} />;
    default:
      return <TrustIndex onNavigate={setPage} onBack={onBack} />;
  }
};
