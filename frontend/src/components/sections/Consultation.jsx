import { useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CONSULTING, APPLICATIONS, CONTACT } from '../../lib/content';
import { Reveal } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';
import { submitEnquiry } from '../../lib/api';

const EMPTY = { name: '', company: '', email: '', phone: '', country: '', application: '', message: '' };

export const Consultation = () => {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitEnquiry({ ...form, source: 'consultation-form' });
      setDone(true);
      setForm(EMPTY);
      toast.success('Enquiry received. We will reply within one working day.');
    } catch (err) {
      toast.error(err?.response?.data?.errors?.[0]?.message || 'Could not send enquiry. Please email us directly.');
    } finally { setBusy(false); }
  };

  return (
    <section id="contact" className="theme-dark" data-testid="consultation-section">
      <div className="wrap py-24 md:py-32">
        <SectionHead no="11" label="Technical consultation" title={['A partner on press,', 'not just a supplier.']} lede="Plates are half the story. The other half is how they are run. Our technical team works with your operators to lock in the settings that make good print repeatable." />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
          <div className="lg:col-span-5 flex flex-col">
            {CONSULTING.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08} className="hairline-t py-7" data-testid={`consulting-item-${i + 1}`}>
                <div className="flex items-center gap-3 mb-2"><span className="chapter-no">0{i + 1}</span><span className="h3">{c.title}</span></div>
                <p className="body">{c.text}</p>
              </Reveal>
            ))}
          </div>

          <div className="print-only lg:col-span-7 lg:pl-10 lg:hairline-l">
            <div className="eyebrow mb-6">Start a conversation</div>
            <div className="grid grid-cols-2 gap-8">
              {[['Email your artwork', CONTACT.email], ['Call / WhatsApp', CONTACT.phone], ['Website', CONTACT.websiteLabel], ['Plant', 'Bengaluru, Karnataka, India']].map(([k, v]) => (
                <div key={k} className="hairline-t pt-4"><div className="eyebrow mb-1">{k}</div><div className="font-display font-medium tracking-tight text-lg">{v}</div></div>
              ))}
            </div>
            <p className="quote text-2xl mt-10">“Send us your press details, substrate and artwork. We reply within one working day with plate recommendations and a delivery schedule.”</p>
          </div>
          <Reveal delay={0.15} className="lg:col-span-7 lg:pl-10 lg:hairline-l no-print">
            {done ? (
              <div className="min-h-[420px] flex flex-col justify-center gap-6" data-testid="enquiry-success">
                <div className="chapter-no">Received</div>
                <h3 className="h2 !text-3xl md:!text-4xl">Thank you. Your artwork brief is with our prepress team.</h3>
                <p className="lede">We reply within one working day with plate recommendations and a delivery schedule to your plant.</p>
                <button onClick={() => setDone(false)} className="btn btn-ghost w-fit" data-testid="enquiry-send-another">Send another enquiry</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2" data-testid="enquiry-form">
                <div className="sm:col-span-2 eyebrow mb-4">Send an enquiry</div>
                <input required className="field" placeholder="Your name" value={form.name} onChange={set('name')} data-testid="enquiry-name-input" />
                <input required className="field" placeholder="Company" value={form.company} onChange={set('company')} data-testid="enquiry-company-input" />
                <input required type="email" className="field" placeholder="Work email" value={form.email} onChange={set('email')} data-testid="enquiry-email-input" />
                <input className="field" placeholder="Phone / WhatsApp" value={form.phone} onChange={set('phone')} data-testid="enquiry-phone-input" />
                <input className="field" placeholder="Country" value={form.country} onChange={set('country')} data-testid="enquiry-country-input" />
                <select className="field" value={form.application} onChange={set('application')} data-testid="enquiry-application-select">
                  <option value="">Application</option>
                  {APPLICATIONS.map((a) => <option key={a.id} value={a.label}>{a.label}</option>)}
                </select>
                <textarea required rows={4} className="field sm:col-span-2 resize-none" placeholder="Tell us about your press, substrate and the job. Artwork links welcome." value={form.message} onChange={set('message')} data-testid="enquiry-message-input" />
                <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-4 mt-6">
                  <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-60" data-testid="consultation-form-submit-button">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : null} Request consultation <ArrowUpRight size={14} className="arr" />
                  </button>
                  <span className="eyebrow">Reply within 1 working day</span>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
