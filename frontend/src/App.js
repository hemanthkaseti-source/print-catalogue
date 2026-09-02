import '@/App.css';
import { Toaster } from 'sonner';
import { useLenis } from './hooks/useLenis';
import { Cursor } from './components/motion/Cursor';
import { Nav } from './components/shared/Nav';
import { Hero } from './components/sections/Hero';
import { RebrandBar, Outcomes } from './components/sections/Outcomes';
import { WhyUs } from './components/sections/WhyUs';
import { FlexcelNX } from './components/sections/FlexcelNX';
import { EskoCDI } from './components/sections/EskoCDI';
import { ShineLED } from './components/sections/ShineLED';
import { ColorMgmt } from './components/sections/ColorMgmt';
import { ProcessFlow } from './components/sections/ProcessFlow';
import { Applications } from './components/sections/Applications';
import { Comparison } from './components/sections/Comparison';
import { Exports } from './components/sections/Exports';
import { Consultation } from './components/sections/Consultation';
import { Leadership, TrustBar } from './components/sections/Leadership';
import { CTA, Footer } from './components/sections/CTAFooter';

function App() {
  useLenis();
  return (
    <div className="App" data-testid="app-root">
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <RebrandBar />
        <Outcomes />
        <WhyUs />
        <FlexcelNX />
        <EskoCDI />
        <ShineLED />
        <ColorMgmt />
        <ProcessFlow />
        <Applications />
        <Comparison />
        <Exports />
        <Consultation />
        <Leadership />
        <TrustBar />
        <CTA />
      </main>
      <Footer />
      <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { borderRadius: 0, fontFamily: 'Inter' } }} />
    </div>
  );
}

export default App;
