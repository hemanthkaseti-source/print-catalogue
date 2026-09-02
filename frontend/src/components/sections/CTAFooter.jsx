import { QRCodeSVG } from 'qrcode.react';
import { ArrowUpRight, ArrowDownToLine, Mail, Phone, Globe, MapPin, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { CONTACT } from '../../lib/content';
import { Reveal, SplitLines } from '../motion/Reveal';
import { scrollToId } from '../../hooks/useLenis';
import { downloadPdf } from '../../lib/api';

const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : CONTACT.website);

export const CTA = () => (
  <section className="theme-light relative overflow-hidden" data-testid="cta-section">
    <div className="wrap py-28 md:py-40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8">
          <Reveal className="flex items-center gap-4 mb-10"><span className="chapter-no">14</span><span className="h-px w-8" style={{ background: 'var(--line)' }} /><span className="eyebrow">Start a job</span></Reveal>
          <SplitLines inView lines={['Send us your artwork.', "We'll send back", 'print-ready plates.']} className="h1 text-[11vw] sm:text-[8vw] lg:text-[5.6vw] leading-[0.95]" />
          <Reveal delay={0.3} className="flex flex-wrap gap-3 mt-12">
            <button onClick={() => scrollToId('contact')} className="btn btn-solid" data-testid="cta-enquiry-button">Send an enquiry <ArrowUpRight size={14} className="arr" /></button>
            <a href={`mailto:${CONTACT.email}`} className="btn btn-ghost" data-testid="cta-email-link"><Mail size={14} /> {CONTACT.email}</a>
            <button onClick={downloadPdf} className="btn btn-ghost no-print" data-testid="download-pdf-button"><ArrowDownToLine size={14} /> Download PDF</button>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="lg:col-span-4 flex lg:justify-end">
          <div className="hairline border p-5 bg-elev inline-flex flex-col gap-4" data-testid="cta-qr-code">
            <QRCodeSVG value={siteUrl()} size={168} level="M" bgColor="transparent" fgColor="#0E0E10" />
            <div className="eyebrow">Scan to open this catalogue</div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="theme-dark" data-testid="footer">
    <div className="wrap pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-4">
          <div className="font-display font-semibold tracking-tight text-2xl">{CONTACT.company}</div>
          <p className="body mt-3 max-w-sm">Flexographic prepress house · Bengaluru, India. Kodak Flexcel NX · Esko CDI · Shine LED. Serving converters across Africa and South Asia since {CONTACT.established}.</p>
          <div className="flex gap-3 mt-6 no-print">
            {[['LinkedIn', Linkedin, '#'], ['Instagram', Instagram, '#'], ['WhatsApp', MessageCircle, `https://wa.me/${CONTACT.phoneRaw}`]].map(([n, Icon, href]) => (
              <a key={n} href={href} target="_blank" rel="noreferrer" aria-label={n} className="w-10 h-10 hairline border grid place-items-center hover:bg-bone hover:text-ink transition-colors duration-300" data-testid={`social-${n.toLowerCase()}`}><Icon size={15} /></a>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-3">
          <div className="eyebrow mb-4 flex items-center gap-2"><MapPin size={12} /> Plant & office</div>
          <address className="not-italic text-sm leading-relaxed" data-testid="footer-address">{CONTACT.addressLines.map((l) => <div key={l}>{l}</div>)}</address>
        </Reveal>
        <Reveal delay={0.16} className="md:col-span-3">
          <div className="eyebrow mb-4">Reach us</div>
          <ul className="text-sm flex flex-col gap-2">
            <li><a href={`tel:+${CONTACT.phoneRaw}`} className="flex items-center gap-2 hover:text-acc transition-colors" data-testid="footer-phone"><Phone size={12} /> {CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-acc transition-colors" data-testid="footer-email"><Mail size={12} /> {CONTACT.email}</a></li>
            <li><a href={CONTACT.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-acc transition-colors" data-testid="footer-website"><Globe size={12} /> {CONTACT.websiteLabel}</a></li>
          </ul>
          <div className="eyebrow mt-8 mb-2">Shipping</div>
          <p className="body text-xs" data-testid="footer-shipping-note">{CONTACT.shipping}</p>
        </Reveal>
        <Reveal delay={0.24} className="md:col-span-2 flex md:justify-end">
          <div className="inline-flex flex-col gap-2">
            <QRCodeSVG value={`mailto:${CONTACT.email}`} size={96} level="M" bgColor="transparent" fgColor="#F9F8F5" data-testid="footer-qr" />
            <span className="eyebrow">Scan to email</span>
          </div>
        </Reveal>
      </div>
      <div className="hairline-t mt-16 pt-6 flex flex-wrap justify-between gap-4 eyebrow">
        <span>© {new Date().getFullYear()} {CONTACT.company}. All rights reserved.</span>
        <span>Precision Prepress. Predictable Print.</span>
        <button onClick={() => scrollToId('top')} className="hover:text-acc transition-colors no-print" data-testid="footer-back-to-top">Back to top ↑</button>
      </div>
    </div>
  </footer>
);
