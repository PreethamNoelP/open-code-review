import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n';
import Footer from '../components/Footer';
import { useResponsive } from '../hooks/useResponsive';
import copyIcon from '../assets/icons/icon-copy.svg';
import docDownloadIcon from '../assets/icons/doc-download.svg';
import docCheckCircleIcon from '../assets/icons/doc-check-circle.svg';
import docEditIcon from '../assets/icons/doc-edit.svg';
import docContentsIcon from '../assets/icons/doc-contents.svg';

/* Toast - same as DocsPage/QuickStartSection */
const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) =>
  ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 88,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.85)',
        padding: '5px 8px 5px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
      }}
    >
      {message}
    </div>,
    document.body
  );

interface Section {
  id: string;
  labelKey: string;
}

const sectionDefs: Section[] = [
  { id: 'overview', labelKey: 'scan.overview' },
  { id: 'usage', labelKey: 'scan.usage' },
  { id: 'preview', labelKey: 'scan.preview' },
  { id: 'batching', labelKey: 'scan.batching' },
  { id: 'toggles', labelKey: 'scan.toggles' },
  { id: 'budget', labelKey: 'scan.budget' },
  { id: 'flags', labelKey: 'scan.flags' },
];

/* ─── Code block matching reference: black bg, 1px border, rounded 6px, copy icon right ─── */
const CodeBlock: React.FC<{ code: string; onCopy?: () => void }> = ({ code, onCopy }) => (
  <div
    style={{
      display: 'flex',
      alignSelf: 'stretch',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      background: '#000000',
      borderRadius: 6,
      padding: '4px 16px',
      border: '1px solid rgba(255,255,255,0.16)',
    }}
  >
    <pre style={{ margin: 0, fontFamily: 'Menlo, Monaco, monospace', fontSize: 13, lineHeight: '24px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1 }}>
      {code}
    </pre>
    {onCopy && (
      <div
        onClick={onCopy}
        style={{ paddingTop: 4, paddingBottom: 4, marginLeft: 12, cursor: 'pointer', flexShrink: 0 }}
      >
        <img src={copyIcon} alt="copy" style={{ width: 16, height: 16 }} />
      </div>
    )}
  </div>
);

/* ─── Icon box (32x32, rgba(255,255,255,0.04) bg, rounded 6px) ─── */
const IconBox: React.FC<{ icon: string }> = ({ icon }) => (
  <div style={{ width: 32, height: 32, display: 'flex', flex: 'none', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
    <img src={icon} style={{ width: 16, height: 16 }} />
  </div>
);

const ScanPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [toastVisible, setToastVisible] = useState(false);
  const lockedRef = useRef<string | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  const sections = sectionDefs.map(s => ({ ...s, label: t(s.labelKey) }));

  const handleCopy = useCallback((text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setToastVisible(true);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }, []);

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (success) setToastVisible(true);
  };

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  useEffect(() => {
    const THRESHOLD = 160;
    const handleScroll = () => {
      if (lockedRef.current) return;
      let bestIndex = 0;
      let bestTop = -Infinity;
      for (let i = 0; i < sectionDefs.length; i++) {
        const el = document.getElementById(sectionDefs[i].id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= THRESHOLD && top > bestTop) {
          bestTop = top;
          bestIndex = i;
        }
      }
      setActiveSection(sectionDefs[bestIndex].id);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(unlockTimerRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    lockedRef.current = id;
    clearTimeout(unlockTimerRef.current);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
    unlockTimerRef.current = setTimeout(() => { lockedRef.current = null; }, 800);
  };

  /* ─── Shared styles ─── */
  const fontFamily = 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif';
  const sectionTitle: React.CSSProperties = { fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: '0 0 16px 0', lineHeight: '28px', fontFamily };
  const subTitle: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: '24px 0 8px 0', lineHeight: '24px', fontFamily };
  const desc: React.CSSProperties = { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: '24px', margin: '0 0 12px 0', fontFamily };
  const sectionSpacing: React.CSSProperties = { marginBottom: 56, display: 'flex', flexDirection: 'column' as const, alignItems: 'stretch' };

  const flagRows: [string, string, string][] = [
    ['--path', t('scan.flag1Desc'), t('scan.flag1Default')],
    ['--exclude', t('scan.flag2Desc'), '—'],
    ['-p, --preview', t('scan.flag3Desc'), 'false'],
    ['--max-tokens-budget', t('scan.flag4Desc'), '0'],
    ['--no-plan', t('scan.flag5Desc'), 'false'],
    ['--no-dedup', t('scan.flag6Desc'), 'false'],
    ['--no-summary', t('scan.flag7Desc'), 'false'],
    ['--batch', t('scan.flag8Desc'), 'by-language'],
    ['-f, --format', t('scan.flag9Desc'), 'text'],
    ['--concurrency', t('scan.flag10Desc'), '8'],
    ['--timeout', t('scan.flag11Desc'), '10'],
    ['--audience', t('scan.flag12Desc'), 'human'],
    ['-b, --background', t('scan.flag13Desc'), '—'],
    ['--max-tools', t('scan.flag14Desc'), t('scan.flag14Default')],
    ['--max-git-procs', t('scan.flag15Desc'), '16'],
    ['--rule', t('scan.flag16Desc'), '—'],
    ['--tools', t('scan.flag17Desc'), t('scan.flag17Default')],
    ['--repo', t('scan.flag18Desc'), t('scan.flag18Default')],
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000000', paddingTop: 72, fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Main layout: content + right sidebar */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 40, padding: isMobile ? '0 20px' : '0 40px', paddingRight: isMobile ? 20 : 300 }}>
        {/* Main content area */}
        <div style={{ display: 'flex', flex: 1, flexShrink: 0, justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 1080, display: 'flex', flex: 1, flexDirection: 'column', paddingTop: 40, paddingBottom: 80 }}>
            {/* Page title "Scan" */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '44px', fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif' }}>{t('navbar.scan')}</p>
            </div>

            {/* ─── Overview: scan vs review ─── */}
            <section id="overview" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.overviewTitle')}</p>
              <p style={desc}>{t('scan.overviewDesc').replace(/<\/?code>/g, '')}</p>

              <p style={subTitle}>{t('scan.overviewVsTitle')}</p>
              <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <IconBox icon={docEditIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>ocr review</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.overviewVsReview').replace(/<\/?code>/g, '')}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <IconBox icon={docDownloadIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>ocr scan</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.overviewVsScan').replace(/<\/?code>/g, '')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Basic Usage ─── */}
            <section id="usage" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.usageTitle')}</p>

              <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconBox icon={docDownloadIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{t('scan.usageWhole')}</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.usageWholeDesc')}</p>
                  </div>
                </div>
                <CodeBlock code="ocr scan" onCopy={() => handleCopy('ocr scan')} />
              </div>

              <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconBox icon={docEditIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{t('scan.usagePath')}</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.usagePathDesc')}</p>
                  </div>
                </div>
                <CodeBlock code="ocr scan --path internal/agent" onCopy={() => handleCopy('ocr scan --path internal/agent')} />
              </div>

              <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconBox icon={docEditIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{t('scan.usageFile')}</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.usageFileDesc')}</p>
                  </div>
                </div>
                <CodeBlock code="ocr scan --path internal/agent/agent.go,internal/diff/scan.go" onCopy={() => handleCopy('ocr scan --path internal/agent/agent.go,internal/diff/scan.go')} />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.16)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconBox icon={docCheckCircleIcon} />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{t('scan.usagePreviewLabel')}</span>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>{t('scan.usagePreviewDesc')}</p>
                  </div>
                </div>
                <CodeBlock code="ocr scan --preview" onCopy={() => handleCopy('ocr scan --preview')} />
              </div>
            </section>

            {/* ─── Preview / dry-run ─── */}
            <section id="preview" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.previewTitle')}</p>
              <p style={desc}>{t('scan.previewDesc').replace(/<\/?code>/g, '')}</p>
              <CodeBlock code="ocr scan --preview" onCopy={() => handleCopy('ocr scan --preview')} />
            </section>

            {/* ─── Batching strategies ─── */}
            <section id="batching" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.batchingTitle')}</p>
              <p style={desc}>{t('scan.batchingDesc').replace(/<\/?code>/g, '')}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {[
                  [t('scan.batchingNone'), t('scan.batchingNoneDesc')],
                  [t('scan.batchingLang'), t('scan.batchingLangDesc')],
                  [t('scan.batchingDir'), t('scan.batchingDirDesc')],
                ].map(([name, d]) => (
                  <div key={name} style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', background: '#000000', borderRadius: 6, padding: '4px 16px', border: '1px solid rgba(255,255,255,0.16)' }}>
                    <p style={{ margin: 0, fontSize: 13, fontFamily: 'Menlo, monospace', color: 'rgba(255,255,255,0.8)' }}>
                      <span style={{ color: '#2BDE5E' }}>{name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 12 }}>{d}</span>
                    </p>
                  </div>
                ))}
              </div>
              <CodeBlock code="ocr scan --batch by-directory" onCopy={() => handleCopy('ocr scan --batch by-directory')} />
            </section>

            {/* ─── Stage toggles ─── */}
            <section id="toggles" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.togglesTitle')}</p>
              <p style={desc}>{t('scan.togglesDesc')}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {[
                  ['--no-plan', t('scan.togglesPlanDesc')],
                  ['--no-dedup', t('scan.togglesDedupDesc')],
                  ['--no-summary', t('scan.togglesSummaryDesc')],
                ].map(([flag, d]) => (
                  <div key={flag} style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', background: '#000000', borderRadius: 6, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.16)' }}>
                    <span style={{ fontSize: 13, fontFamily: 'Menlo, monospace', color: '#2BDE5E', flexShrink: 0, marginRight: 12 }}>{flag}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: '20px' }}>{d}</span>
                  </div>
                ))}
              </div>
              <CodeBlock code="ocr scan --no-plan --no-dedup --no-summary" onCopy={() => handleCopy('ocr scan --no-plan --no-dedup --no-summary')} />
            </section>

            {/* ─── Token budget ─── */}
            <section id="budget" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.budgetTitle')}</p>
              <p style={desc}>{t('scan.budgetDesc').replace(/<\/?code>/g, '')}</p>
              <CodeBlock code="ocr scan --max-tokens-budget 500000" onCopy={() => handleCopy('ocr scan --max-tokens-budget 500000')} />
            </section>

            {/* ─── Flag reference ─── */}
            <section id="flags" style={{ ...sectionSpacing, scrollMarginTop: 100 }}>
              <p style={sectionTitle}>{t('scan.flagsTitle')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ width: 160, flexShrink: 0, padding: '10px 12px' }}><span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{t('scan.flagCol1')}</span></div>
                  <div style={{ flex: 1, padding: '10px 12px' }}><span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{t('scan.flagCol2')}</span></div>
                  <div style={{ width: 120, flexShrink: 0, padding: '10px 12px' }}><span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{t('scan.flagCol3')}</span></div>
                </div>
                {/* Rows */}
                {flagRows.map(([flag, d, def], idx) => (
                  <div key={flag} style={{ display: 'flex', borderBottom: idx < flagRows.length - 1 ? '1px solid rgba(255,255,255,0.16)' : 'none' }}>
                    <div style={{ width: 160, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                      <span style={{ fontSize: 12, fontFamily: 'Menlo, monospace', color: 'rgba(255,255,255,0.7)' }}>{flag}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{d}</span>
                    </div>
                    <div style={{ width: 120, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                      <span style={{ fontSize: 12, fontFamily: 'Menlo, monospace', color: 'rgba(255,255,255,0.5)' }}>{def}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ ...desc, marginTop: 16, fontSize: 12 }}>{t('scan.flagsNote').replace(/<\/?code>/g, '')}</p>
            </section>
          </div>
        </div>

        {/* ─── Right sidebar: CONTENTS (fixed) ─── */}
        {!isMobile && (
          <div style={{ position: 'fixed', top: 112, right: 'max(40px, calc((100vw - 1440px) / 2 + 32px))', width: 220, zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <img src={docContentsIcon} style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{t('scan.toc')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 14,
                    fontFamily: 'PingFang SC, -apple-system, sans-serif',
                    fontWeight: activeSection === s.id ? 500 : 400,
                    color: activeSection === s.id ? '#2BDE5E' : 'rgba(255,255,255,0.5)',
                    lineHeight: '22px',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <Toast message={t('quickstart.copied')} visible={toastVisible} />
    </div>
  );
};

export default ScanPage;
