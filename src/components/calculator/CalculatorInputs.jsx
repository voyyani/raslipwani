import React from 'react';
import PropTypes from 'prop-types';
import { Home, DollarSign } from 'lucide-react';

/**
 * The investment calculator's parameters panel: currency, value, deposit,
 * yield, appreciation, holding period, occupancy and management fee. Moved out
 * of `InvestmentCalculator.jsx` (Task 27) unchanged.
 */
const CalculatorInputs = ({ inputs, currencies, formatCurrency, onInputChange }) => (
<div className="bg-surface-raised rounded-2xl shadow-xl p-8">
  <h3 className="text-2xl font-bold text-content mb-6 flex items-center gap-2">
    <Home className="w-6 h-6 text-brand" />
    Investment Parameters
  </h3>

  <div className="space-y-6">
    {/* Currency Selector */}
    <div>
      <label htmlFor="calc-currency" className="block text-sm font-semibold text-content-muted mb-2">
        Currency
      </label>
      <select
        id="calc-currency"
        value={inputs.currency}
        onChange={(e) => onInputChange('currency', e.target.value)}
        className="w-full px-4 py-3 border-2 border-line-strong rounded-lg focus:border-brand focus:outline-none text-lg"
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
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Property Value: {formatCurrency(inputs.propertyValue)}
      </label>
      <input
        type="range"
        min="20000"
        max="500000"
        step="5000"
        value={inputs.propertyValue}
        onChange={(e) => onInputChange('propertyValue', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-brand"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>{formatCurrency(20000)}</span>
        <span>{formatCurrency(500000)}</span>
      </div>
    </div>

    {/* Down Payment */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Down Payment: {inputs.downPayment}%
      </label>
      <input
        type="range"
        min="10"
        max="100"
        step="5"
        value={inputs.downPayment}
        onChange={(e) => onInputChange('downPayment', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-brand"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>10%</span>
        <span>100%</span>
      </div>
    </div>

    {/* Annual Rental Yield */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Expected Annual Rental Yield: {inputs.rentalYield}%
      </label>
      <input
        type="range"
        min="4"
        max="15"
        step="0.5"
        value={inputs.rentalYield}
        onChange={(e) => onInputChange('rentalYield', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-success"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>4%</span>
        <span>15%</span>
      </div>
    </div>

    {/* Property Appreciation */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Annual Property Appreciation: {inputs.appreciation}%
      </label>
      <input
        type="range"
        min="3"
        max="20"
        step="0.5"
        value={inputs.appreciation}
        onChange={(e) => onInputChange('appreciation', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-success"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>3%</span>
        <span>20%</span>
      </div>
    </div>

    {/* Holding Period */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Holding Period: {inputs.holdingPeriod} years
      </label>
      <input
        type="range"
        min="1"
        max="20"
        step="1"
        value={inputs.holdingPeriod}
        onChange={(e) => onInputChange('holdingPeriod', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>1 year</span>
        <span>20 years</span>
      </div>
    </div>

    {/* Occupancy Rate */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Expected Occupancy Rate: {inputs.occupancyRate}%
      </label>
      <input
        type="range"
        min="50"
        max="100"
        step="5"
        value={inputs.occupancyRate}
        onChange={(e) => onInputChange('occupancyRate', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-brand"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>

    {/* Management Fee */}
    <div>
      <label className="block text-sm font-semibold text-content-muted mb-2">
        Property Management Fee: {inputs.managementFee}%
      </label>
      <input
        type="range"
        min="0"
        max="20"
        step="1"
        value={inputs.managementFee}
        onChange={(e) => onInputChange('managementFee', e.target.value)}
        className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-warning"
      />
      <div className="flex justify-between text-xs text-content-subtle mt-1">
        <span>0%</span>
        <span>20%</span>
      </div>
    </div>
  </div>
</div>
);

CalculatorInputs.propTypes = {
  inputs: PropTypes.object.isRequired,
  currencies: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default CalculatorInputs;
