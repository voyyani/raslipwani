import React from 'react';
import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';

/**
 * The UN-housing page's hero and the four figures under it. Moved out of
 * `UNHousing.jsx` (Task 27) unchanged.
 */
const UnHousingHero = () => (
  <section className="relative bg-gradient-to-br from-brand-hover via-brand-hover to-indigo-900 text-content-on-brand py-20">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          to="/international"
          className="text-sm text-content-on-brand/80 hover:text-content-on-brand transition-colors"
        >
          &larr; International
        </Link>
      </nav>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-content-on-brand/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-content-on-brand/20">
          <Building className="w-5 h-5" />
          <span className="text-sm font-medium">Official UN Housing Partner</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Premium Housing for<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            UN Staff & Diplomats
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-content-on-brand/90 mb-8 max-w-3xl mx-auto">
          Exclusive properties near the UN Complex in Gigiri. 
          Fast-track approvals, furnished options, and diplomatic services support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a 
            href="#properties"
            className="bg-warning-content hover:bg-accent text-content px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            View Available Properties
          </a>
          <Link 
            to="/contact?type=un-housing"
            className="bg-content-on-brand/10 hover:bg-content-on-brand/20 backdrop-blur-sm border-2 border-content-on-brand/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Contact Us
          </Link>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-accent">48hrs</div>
            <div className="text-sm text-content-on-brand/80">Average Approval Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent">50+</div>
            <div className="text-sm text-content-on-brand/80">UN Staff Housed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent">100%</div>
            <div className="text-sm text-content-on-brand/80">Furnished Options</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default UnHousingHero;
