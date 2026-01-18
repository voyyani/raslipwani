import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Home, Calendar, Percent, AlertCircle } from 'lucide-react';

const InvestmentCalculator = () => {
  const [inputs, setInputs] = useState({
    propertyValue: 50000,
    currency: 'USD',
    downPayment: 30,
    rentalYield: 8,
    appreciation: 10,
    holdingPeriod: 5,
    managementFee: 10,
    occupancyRate: 90
  });

  const [results, setResults] = useState(null);

  const currencies = {
    USD: { symbol: '$', rate: 1, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    KES: { symbol: 'KSh', rate: 129.5, name: 'Kenyan Shilling' }
  };

  const formatCurrency = (amount) => {
    const curr = currencies[inputs.currency];
    const convertedAmount = amount * curr.rate;
    
    if (inputs.currency === 'KES') {
      return `${curr.symbol} ${convertedAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
    }
    return `${curr.symbol}${convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const calculateROI = () => {
    const propertyValue = parseFloat(inputs.propertyValue);
    const downPaymentPercent = parseFloat(inputs.downPayment);
    const rentalYield = parseFloat(inputs.rentalYield);
    const appreciation = parseFloat(inputs.appreciation);
    const years = parseInt(inputs.holdingPeriod);
    const managementFee = parseFloat(inputs.managementFee);
    const occupancy = parseFloat(inputs.occupancyRate);

    // Initial investment
    const initialInvestment = (propertyValue * downPaymentPercent) / 100;
    const loanAmount = propertyValue - initialInvestment;

    // Annual rental income
    const grossAnnualRent = (propertyValue * rentalYield) / 100;
    const effectiveRent = (grossAnnualRent * occupancy) / 100;
    const netAnnualRent = effectiveRent - (effectiveRent * managementFee) / 100;

    // Property appreciation
    const futureValue = propertyValue * Math.pow(1 + appreciation / 100, years);
    const totalAppreciation = futureValue - propertyValue;

    // Total rental income over period
    const totalRentalIncome = netAnnualRent * years;

    // Total returns
    const totalReturns = totalRentalIncome + totalAppreciation;
    const netProfit = totalReturns - initialInvestment;
    const roi = (netProfit / initialInvestment) * 100;
    const annualizedROI = roi / years;

    // Cash on cash return (first year)
    const cashOnCash = (netAnnualRent / initialInvestment) * 100;

    setResults({
      initialInvestment,
      loanAmount,
      netAnnualRent,
      totalRentalIncome,
      futureValue,
      totalAppreciation,
      totalReturns,
      netProfit,
      roi,
      annualizedROI,
      cashOnCash,
      monthlyIncome: netAnnualRent / 12
    });
  };

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Investment Calculator
        </h2>
        <p className="text-xl text-gray-600">
          Calculate your potential returns from Nairobi real estate investments
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            Investment Parameters
          </h3>

          <div className="space-y-6">
            {/* Currency Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={inputs.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              >
                {Object.entries(currencies).map(([code, curr]) => (
                  <option key={code} value={code}>
                    {curr.symbol} {curr.name} ({code})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Value: {formatCurrency(inputs.propertyValue)}
              </label>
              <input
                type="range"
                min="20000"
                max="500000"
                step="5000"
                value={inputs.propertyValue}
                onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(20000)}</span>
                <span>{formatCurrency(500000)}</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Down Payment: {inputs.downPayment}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={inputs.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Annual Rental Yield */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Annual Rental Yield: {inputs.rentalYield}%
              </label>
              <input
                type="range"
                min="4"
                max="15"
                step="0.5"
                value={inputs.rentalYield}
                onChange={(e) => handleInputChange('rentalYield', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Property Appreciation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Annual Property Appreciation: {inputs.appreciation}%
              </label>
              <input
                type="range"
                min="3"
                max="20"
                step="0.5"
                value={inputs.appreciation}
                onChange={(e) => handleInputChange('appreciation', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Holding Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Holding Period: {inputs.holdingPeriod} years
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={inputs.holdingPeriod}
                onChange={(e) => handleInputChange('holdingPeriod', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 year</span>
                <span>20 years</span>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Occupancy Rate: {inputs.occupancyRate}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={inputs.occupancyRate}
                onChange={(e) => handleInputChange('occupancyRate', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Management Fee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Management Fee: {inputs.managementFee}%
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={inputs.managementFee}
                onChange={(e) => handleInputChange('managementFee', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Investment Returns
            </h3>

            {results && (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-blue-100 mb-1">Total ROI</div>
                  <div className="text-4xl font-bold">{results.roi.toFixed(1)}%</div>
                  <div className="text-sm text-blue-200 mt-1">
                    Over {inputs.holdingPeriod} years
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-xs text-blue-100 mb-1">Annual ROI</div>
                    <div className="text-2xl font-bold">{results.annualizedROI.toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-xs text-blue-100 mb-1">Cash on Cash</div>
                    <div className="text-2xl font-bold">{results.cashOnCash.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                  <div className="text-sm text-green-100 mb-1">Net Profit</div>
                  <div className="text-3xl font-bold">{formatCurrency(results.netProfit)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Breakdown</h3>
            
            {results && (
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Initial Investment
                  </span>
                  <span className="font-semibold">{formatCurrency(results.initialInvestment)}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Monthly Rental Income
                  </span>
                  <span className="font-semibold text-green-600">{formatCurrency(results.monthlyIncome)}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Annual Rental Income</span>
                  <span className="font-semibold text-green-600">{formatCurrency(results.netAnnualRent)}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Total Rental ({inputs.holdingPeriod} years)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(results.totalRentalIncome)}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Property Value (Future)
                  </span>
                  <span className="font-semibold text-blue-600">{formatCurrency(results.futureValue)}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Capital Appreciation</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(results.totalAppreciation)}</span>
                </div>

                <div className="flex justify-between py-4 bg-green-50 rounded-lg px-4 mt-4">
                  <span className="font-bold text-gray-900 text-lg">Total Returns</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(results.totalReturns)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Investment Disclaimer</h4>
                <p className="text-sm text-yellow-800">
                  These calculations are estimates based on the parameters you've provided. 
                  Actual returns may vary based on market conditions, property performance, and other factors. 
                  Consult with our investment advisors for personalized projections.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center">
            <h4 className="text-xl font-bold mb-2">Like What You See?</h4>
            <p className="mb-4 text-blue-100">
              Schedule a consultation with our investment team
            </p>
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
