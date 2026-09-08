import React from 'react';
import { Helmet } from 'react-helmet-async';

import UnHousingHero from './un-housing/UnHousingHero';
import UnHousingServices from './un-housing/UnHousingServices';
import UnHousingProperties from './un-housing/UnHousingProperties';
import UnHousingTestimonials from './un-housing/UnHousingTestimonials';
import UnHousingProcess from './un-housing/UnHousingProcess';
import UnHousingCta from './un-housing/UnHousingCta';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Housing for UN staff and diplomats. The six sections and the copy they
 * render are their own modules (Task 27).
 */
const UNHousing = () => (
  <>
    <Helmet>
      <title>UN Housing Solutions | Diplomatic Housing Nairobi | Raslipwani</title>
      <meta
        name="description"
        content="Premium housing for UN staff, diplomats and international organizations in Nairobi. Properties near UN complex in Gigiri. Fast-track approvals, furnished options."
      />
      <meta name="keywords" content="UN housing Nairobi, diplomatic housing Kenya, Gigiri apartments, UN staff accommodation, international housing Nairobi" />
    </Helmet>

    <main className="flex-grow">
      <UnHousingHero />
      <UnHousingServices />
      <UnHousingProperties formatCurrency={formatCurrency} />
      <UnHousingTestimonials />
      <UnHousingProcess />
      <UnHousingCta />
    </main>
  </>
);

export default UNHousing;
