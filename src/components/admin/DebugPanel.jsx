import React, { useState, useEffect, useRef } from 'react';
import { FaBug, FaTimes, FaTrash, FaDownload } from 'react-icons/fa';

/**
 * DebugPanel - On-screen console for mobile debugging
 * Captures console.log, console.error, console.warn
 * Saves logs to localStorage for later download
 * 
 * To show the debug icon, triple-tap anywhere on the screen
 */
const DebugPanel = ({ hidden = true }) => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(!hidden);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  // Triple-tap to show debug panel
  useEffect(() => {
    const handleTripleTap = () => {
      tapCountRef.current += 1;
      
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      
      tapTimerRef.current = setTimeout(() => {
        if (tapCountRef.current >= 5) {
          setIsVisible(prev => !prev);
          console.log('Debug panel ' + (isVisible ? 'hidden' : 'shown'));
        }
        tapCountRef.current = 0;
      }, 500);
    };

    document.addEventListener('click', handleTripleTap);
    return () => document.removeEventListener('click', handleTripleTap);
  }, [isVisible]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const logEntry = {
        type,
        message,
        time: new Date().toISOString(),
        url: window.location.pathname
      };

      setLogs(prev => {
        const newLogs = [...prev.slice(-200), logEntry]; // Keep last 200 logs
        // Save to localStorage
        try {
          localStorage.setItem('debug_logs', JSON.stringify(newLogs));
        } catch {
          // localStorage full, clear old logs
          localStorage.removeItem('debug_logs');
        }
        return newLogs;
      });
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', args);
    };

    // Load existing logs from localStorage
    try {
      const savedLogs = localStorage.getItem('debug_logs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch {
      // A corrupt or oversized debug_logs entry is not worth surfacing;
      // the panel simply starts empty.
    }

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Download logs as file
  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.time}] [${log.type.toUpperCase()}] [${log.url}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/30';
      case 'warn': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-green-400 bg-gray-800';
    }
  };

  // Hidden mode - still captures logs but no UI
  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-[9999] bg-purple-600 text-white p-3 rounded-full shadow-lg"
      >
        <FaBug className="text-lg" />
        {logs.filter(l => l.type === 'error').length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {logs.filter(l => l.type === 'error').length}
          </span>
        )}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-24 z-[9999] bg-gray-900 rounded-lg shadow-2xl max-h-[60vh] flex flex-col border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <span className="text-white font-medium text-sm">Debug Console ({logs.length} logs)</span>
            <div className="flex gap-2">
              <button
                onClick={downloadLogs}
                className="text-green-400 hover:text-green-300 p-1"
                title="Download logs"
              >
                <FaDownload className="text-sm" />
              </button>
              <button
                onClick={() => { setLogs([]); localStorage.removeItem('debug_logs'); }}
                className="text-gray-400 hover:text-white p-1"
                title="Clear logs"
              >
                <FaTrash className="text-sm" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`p-1.5 rounded ${getLogColor(log.type)}`}>
                  <span className="text-gray-500">[{new Date(log.time).toLocaleTimeString()}]</span>{' '}
                  <span className="text-blue-400">[{log.url}]</span>{' '}
                  <span className="whitespace-pre-wrap break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
