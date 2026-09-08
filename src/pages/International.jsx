import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import InvestmentCalculator from '../components/InvestmentCalculator';
import Modal from '../components/ui/Modal';
import InternationalHero from './international/InternationalHero';
import AudienceTriage from './international/AudienceTriage';
import WhyNairobiSection from './international/WhyNairobiSection';
import InvestmentOpportunities from './international/InvestmentOpportunities';
import DiasporaSection from './international/DiasporaSection';
import RelocationServices from './international/RelocationServices';
import FeaturedProperties from './international/FeaturedProperties';
import InternationalCta from './international/InternationalCta';
import { currencies } from './international/internationalContent';

/**
 * The /international page: one long scroll for three different audiences,
 * with a currency the visitor picks once and every price on the page respects.
 *
 * The eight sections are their own components and the copy is data (Task 25);
 * what stays here is the currency, the section refs the navigation scrolls
 * between, and the calculator dialog.
 */
const International = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCalculator, setShowCalculator] = useState(false);

  const sectionRefs = {
    overview: useRef(null),
    invest: useRef(null),
    diaspora: useRef(null),
    services: useRef(null),
    properties: useRef(null),
  };

  const scrollToSection = (section) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(section);
  };

  const formatCurrency = (amount) => {
    const curr = currencies.find(c => c.code === selectedCurrency);
    const convertedAmount = amount * curr.rate;

    if (selectedCurrency === 'KES') {
      return `${curr.symbol} ${convertedAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
    }
    return `${curr.symbol}${convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  return (
    <>
      <Helmet>
        <title>International Property Services | Nairobi Real Estate | Raslipwani</title>
        <meta
          name="description"
          content="International real estate services in Nairobi. Investment opportunities for diaspora, expats, and global investors. Remote property management, multi-currency support, 12-15% ROI."
        />
        <meta name="keywords" content="Nairobi international property, Kenya diaspora investment, expat housing Nairobi, international real estate Kenya, African diaspora property" />
      </Helmet>

      <main className="flex-grow">
        <InternationalHero
          activeSection={activeSection}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          onNavigate={scrollToSection}
          onOpenCalculator={() => setShowCalculator(true)}
        />

        <AudienceTriage onScrollToDiaspora={scrollToSection} />

        {/*
          The calculator used to render its own overlay with a hand-drawn close
          cross and no way out but the mouse: no focus trap, no Escape, no focus
          returned to the button that opened it. `Modal` carries all three.
        */}
        <Modal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          title="Investment Calculator"
          description="Model returns on a Nairobi property before you commit to a viewing."
          size="3xl"
          bodyClassName=""
        >
          <InvestmentCalculator />
        </Modal>

        <WhyNairobiSection ref={sectionRefs.overview} />
        <InvestmentOpportunities ref={sectionRefs.invest} />
        <DiasporaSection ref={sectionRefs.diaspora} formatCurrency={formatCurrency} />
        <RelocationServices ref={sectionRefs.services} />
        <FeaturedProperties ref={sectionRefs.properties} formatCurrency={formatCurrency} />
        <InternationalCta onOpenCalculator={() => setShowCalculator(true)} />
      </main>
    </>
  );
};

export default International;
