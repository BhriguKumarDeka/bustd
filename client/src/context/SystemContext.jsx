import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const SystemContext = createContext();

export function SystemProvider({ children }) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.getSystemStatus();
      setSystemStatus(res.data);
    } catch (err) {
      console.warn('System status check failed:', err.message);
      // Fallback object so UI stays functional
      setSystemStatus({
        appName: 'BUSTD',
        tagline: 'Spot the red flags.',
        storage: {
          mode: 'local_file_store',
          isMongoConnected: false,
          description: 'Local File Store Fallback (Persisting to server/data/store.json)'
        },
        ocr: {
          provider: 'deterministic_mock_ocr',
          isHosted: false,
          description: 'Deterministic Multi-Panel Spatial OCR Adapter'
        },
        demoUser: {
          name: 'Senior Packaging QA Inspector',
          role: 'Lead Metrologist'
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SystemContext.Provider value={{ systemStatus, loading, refreshStatus: fetchStatus, addToast, toasts, removeToast }}>
      {children}
    </SystemContext.Provider>
  );
}

export const useSystem = () => useContext(SystemContext);
