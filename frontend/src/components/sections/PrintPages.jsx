import { QRCodeSVG } from 'qrcode.react';
import { IMG, CONTACT, CHAPTERS } from '../../lib/content';

const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : CONTACT.website);

export const PrintCover = () => (
  <section className="hidden print:flex theme-dark relative overflow-hidden" data-testid="print-cover" aria-hidden="true">
    <img src={IMG.heroMacro} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
    <div className="relative wrap flex flex-col justify-between" style={{ minHeight: '100vh', paddingTop: 72, paddingBottom: 64 }}>
      <div className="flex items-center justify-between eyebrow">
        <span className="flex items-center gap-3 font-display font-semibold tracking-tight text-base normal-case text-bone"><span className="w-2 h-2 bg-bone" />Sree Bloomy Graphics Pvt. Ltd.</span>
        <span>Company profile · {new Date().getFullYear()}</span>
      </div>
      <div>
        <div className="eyebrow mb-6">Flexographic prepress · Bengaluru, India · Est. {CONTACT.established}</div>
        <h1 className="h1 text-[6.5vw] leading-[0.92]">Precision Prepress.<br />Predictable Print.</h1>
        <p className="lede mt-8 max-w-xl">Kodak Flexcel NX · Esko CDI · Shine LED · Colour management · Exports to 6 countries</p>
      </div>
      <div className="hairline-t pt-5 flex items-center justify-between eyebrow">
        <span>{CONTACT.websiteLabel}</span><span>{CONTACT.email}</span><span>{CONTACT.phone}</span>
      </div>
    </div>
  </section>
);

export const PrintContents = () => (
  <section className="hidden print:flex theme-light" data-testid="print-contents" aria-hidden="true">
    <div className="wrap grid grid-cols-12 gap-10">
      <div className="col-span-4">
        <div className="eyebrow mb-4">Contents</div>
        <h2 className="h2">What's inside.</h2>
        <p className="body mt-6">Every chapter answers one question: how does this improve the print coming off your press?</p>
        <div className="mt-10 inline-flex flex-col gap-2">
          <QRCodeSVG value={siteUrl()} size={110} level="M" bgColor="transparent" fgColor="#0E0E10" />
          <span className="eyebrow">Interactive version online</span>
        </div>
      </div>
      <ol className="col-span-8 grid grid-cols-2 gap-x-10">
        {CHAPTERS.map(([no, title, page]) => (
          <li key={no} className="hairline-t py-3 grid grid-cols-[36px_1fr_auto] gap-4 items-baseline">
            <span className="chapter-no">{no}</span>
            <span className="font-display font-medium tracking-tight">{title}</span>
            <span className="font-mono text-xs text-muted">{page}</span>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
