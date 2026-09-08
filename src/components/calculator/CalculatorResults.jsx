import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp } from 'lucide-react';

/**
 * The investment calculator's results panel. Moved out of
 * `InvestmentCalculator.jsx` (Task 27) unchanged.
 */
const CalculatorResults = ({ results, inputs, formatCurrency }) => (
<div className="space-y-6">
  {/* Key Metrics */}
  <div className="bg-gradient-to-br from-brand to-indigo-700 rounded-2xl shadow-xl p-8 text-content-on-media">
    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <TrendingUp className="w-6 h-6" />
      Investment Returns
    </h3>

    {results && (
      <div className="space-y-6">
        <div className="bg-surface-raised/10 backdrop-blur-sm rounded-xl p-6 border border-line-media/20">
          <div className="text-sm text-content-on-media/90 mb-1">Total ROI</div>
          <div className="text-4xl font-bold">{results.roi.toFixed(1)}%</div>
          <div className="text-sm text-content-on-media/80 mt-1">
            Over {inputs.holdingPeriod} years
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-raised/10 backdrop-blur-sm rounded-xl p-4 border border-line-media/20">
            <div className="text-xs text-content-on-media/90 mb-1">Annual ROI</div>
            <div className="text-2xl font-bold">{results.annualizedROI.toFixed(1)}%</div>
          </div>
          <div className="bg-surface-raised/10 backdrop-blur-sm rounded-xl p-4 border border-line-media/20">
            <div className="text-xs text-content-on-media/90 mb-1">Cash on Cash</div>
            <div className="text-2xl font-bold">{results.cashOnCash.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-success-content/20 backdrop-blur-sm rounded-xl p-4 border border-success-border/30">
          <div className="text-sm text-green-100 mb-1">Net Profit</div>
          <div className="text-3xl font-bold">{formatCurrency(results.netProfit)}</div>
        </div>
      </div>
    )}
  </div>

  {/* Detailed Breakdown */}
  <div className="bg-surface-raised rounded-2xl shadow-xl p-8">
    <h3 className="text-xl font-bold text-content mb-6">Detailed Breakdown</h3>
    
    {results && (
      <div className="space-y-4">
        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Initial Investment
          </span>
          <span className="font-semibold">{formatCurrency(results.initialInvestment)}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Monthly Rental Income
          </span>
          <span className="font-semibold text-success-content">{formatCurrency(results.monthlyIncome)}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted">Annual Rental Income</span>
          <span className="font-semibold text-success-content">{formatCurrency(results.netAnnualRent)}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted">Total Rental ({inputs.holdingPeriod} years)</span>
          <span className="font-semibold text-success-content">{formatCurrency(results.totalRentalIncome)}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Property Value (Future)
          </span>
          <span className="font-semibold text-brand">{formatCurrency(results.futureValue)}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-line">
          <span className="text-content-muted">Capital Appreciation</span>
          <span className="font-semibold text-brand">{formatCurrency(results.totalAppreciation)}</span>
        </div>

        <div className="flex justify-between py-4 bg-success-surface rounded-lg px-4 mt-4">
          <span className="font-bold text-content text-lg">Total Returns</span>
          <span className="font-bold text-success-content text-lg">{formatCurrency(results.totalReturns)}</span>
        </div>
      </div>
    )}
  </div>

  {/* Disclaimer */}
  <div className="bg-warning-surface border-2 border-warning-border rounded-xl p-6">
    <div className="flex gap-3">
      <AlertCircle className="w-5 h-5 text-warning-content flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-warning-content mb-2">Investment Disclaimer</h4>
        <p className="text-sm text-warning-content">
          These calculations are estimates based on the parameters you've provided. 
          Actual returns may vary based on market conditions, property performance, and other factors. 
          Consult with our investment advisors for personalized projections.
        </p>
      </div>
    </div>
  </div>

  {/* CTA */}
  <div className="bg-gradient-to-r from-brand to-indigo-600 rounded-xl p-6 text-content-on-media text-center">
    <h4 className="text-xl font-bold mb-2">Like What You See?</h4>
    <p className="mb-4 text-content-on-media/90">
      Schedule a consultation with our investment team
    </p>
    <button className="bg-surface-raised text-brand hover:bg-surface-sunken px-8 py-3 rounded-lg font-semibold transition-all">
      Get Started
    </button>
  </div>
</div>
);

CalculatorResults.propTypes = {
  results: PropTypes.object,
  inputs: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};

CalculatorResults.defaultProps = {
  results: null,
};

export default CalculatorResults;
