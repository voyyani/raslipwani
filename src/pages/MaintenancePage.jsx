import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

const formatTimeUnit = (value) => String(value).padStart(2, '0');

const getTimeLeft = (targetDate) => {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export default function MaintenancePage({
  durationDays = 7,
  message = 'We are refining the experience behind the scenes to bring you a faster, smoother, and more secure platform.',
  brandName = 'Raslipwani Properties',
  brandLogo = 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg',
  tagline = 'Your Premier Real Estate Partner Across Kenya',
}) {
  const targetDate = useMemo(
    () => new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000),
    [durationDays]
  );

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const isComplete = timeLeft.total <= 0;

  const highlights = [
    'Performance upgrades and smoother browsing',
    'New property experience and improved search',
    'Enhanced support and booking workflows',
  ];

  const countdownItems = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="maintenance-shell">
      <div className="maintenance-orb orb-one" />
      <div className="maintenance-orb orb-two" />
      <div className="maintenance-inner">
        <header className="maintenance-topbar">
          <div className="maintenance-brand-wrap">
            <img src={brandLogo} alt={`${brandName} logo`} className="maintenance-brand-logo" />
            <div>
              <div className="maintenance-brand-name">{brandName}</div>
              <div className="maintenance-brand-tagline">{tagline}</div>
            </div>
          </div>
        </header>

        <div className="maintenance-grid">
          <div className="maintenance-copy-block">
            <div className="maintenance-badge">
              <ShieldCheck size={18} />
              Scheduled maintenance
            </div>

            <h1 className="maintenance-title">We&apos;re making things better.</h1>

            <p className="maintenance-text">
              {message}
            </p>

            <div className="maintenance-list">
              {highlights.map((item) => (
                <div key={item} className="maintenance-list-item">
                  <Sparkles size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="maintenance-actions">
              <a href="mailto:info@raslipwani.com?subject=Maintenance%20Update" className="maintenance-primary-btn">
                Contact the team
                <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="maintenance-card">
            <div className="maintenance-card-header">
              <div className="maintenance-status-pill">
                <span className="maintenance-status-dot" />
                {isComplete ? 'Live now' : 'Maintenance window'}
              </div>
              <div className="maintenance-icon-wrap">
                <Clock3 size={18} />
              </div>
            </div>

            <div className="maintenance-card-body">
              <p className="maintenance-card-eyebrow">Estimated return</p>
              <h2>{formatDate(targetDate)}</h2>

              <div className="countdown-grid">
                {countdownItems.map(({ label, value }) => (
                  <div key={label} className="countdown-box">
                    <span>{formatTimeUnit(value)}</span>
                    <small>{label}</small>
                  </div>
                ))}
              </div>

              <div className="maintenance-progress-row">
                <Wrench size={16} />
                <span>{isComplete ? 'The site is back online and ready to help you.' : 'We are improving the platform with care and attention.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
