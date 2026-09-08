import React, { useState, useEffect } from 'react';
import CalculatorInputs from './calculator/CalculatorInputs';
import CalculatorResults from './calculator/CalculatorResults';

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
        <h2 className="text-4xl font-bold text-content mb-4">
          Investment Calculator
        </h2>
        <p className="text-xl text-content-muted">
          Calculate your potential returns from Nairobi real estate investments
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <CalculatorInputs
          inputs={inputs}
          currencies={currencies}
          formatCurrency={formatCurrency}
          onInputChange={handleInputChange}
        />

        <CalculatorResults
          results={results}
          inputs={inputs}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default InvestmentCalculator;
