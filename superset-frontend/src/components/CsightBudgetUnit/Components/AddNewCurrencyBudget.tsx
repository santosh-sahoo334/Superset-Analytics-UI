import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { HTTP } from "../../CsightCommon/config/http-common";
import { useAuth } from "../../CsightCommon/context/AuthContext";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface AddNewCurrencyBudgetProps {
  editId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CurrencyFormData {
  source_currency: string;
  destination_currency: string;
  exchange_rate: string;
  start_date: Date | null;
  end_date: Date | null;
}

const AddNewCurrencyBudget: React.FC<AddNewCurrencyBudgetProps> = ({ 
  editId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<CurrencyFormData>({
    source_currency: 'USD',
    destination_currency: 'INR',
    exchange_rate: '',
    start_date: new Date(),
    end_date: null, // Tomorrow
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const toast = useRef<Toast>(null);

  // Common currency options
  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'INR', value: 'INR' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
    { label: 'CAD', value: 'CAD' },
    { label: 'AUD', value: 'AUD' },
  ];

  useEffect(() => {
    if (editId) {
      fetchCurrencyRate();
    }
  }, [editId]);

  const fetchCurrencyRate = async () => {
    if (!editId) return;
    
    setLoading(true);
    try {
      const response = await HTTP.get(`/currency_exchange_rates/${editId}`, {
        headers: { Authorization: accessToken },
      });
      
      if (response.status === 200 && response.data.result) {
        const data = response.data.result;
        setFormData({
          source_currency: data.source_currency,
          destination_currency: data.destination_currency,
          exchange_rate: data.exchange_rate.toString(),
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch currency rate details',
        });
      }
    } catch (error) {
      console.error('Error fetching currency rate:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch currency rate details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CurrencyFormData, value: any) => {
    // Special handling for exchange_rate to allow only numeric values
    if (field === 'exchange_rate') {
      // Allow empty string, digits, and one decimal point
      const numericRegex = /^(\d*\.?\d*)$/;
      if (value === '' || numericRegex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
      // Don't update state if input doesn't match numeric pattern
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.source_currency) {
      newErrors.source_currency = 'Source currency is required';
    }

    if (!formData.destination_currency) {
      newErrors.destination_currency = 'Destination currency is required';
    }

    if (formData.source_currency === formData.destination_currency) {
      newErrors.destination_currency = 'Source and destination currencies must be different';
    }

    if (!formData.exchange_rate) {
      newErrors.exchange_rate = 'Exchange rate is required';
    } else {
      const rate = parseFloat(formData.exchange_rate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.exchange_rate = 'Exchange rate must be a positive number';
      } else if (!/^\d*\.?\d*$/.test(formData.exchange_rate)) {
        newErrors.exchange_rate = 'Exchange rate must contain only numbers and one decimal point';
      }
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be equal or after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        source_currency: formData.source_currency,
        destination_currency: formData.destination_currency,
        exchange_rate: parseFloat(formData.exchange_rate),
        start_date: formatDate(formData.start_date!),
        end_date: formatDate(formData.end_date!),
      };

      const url = editId ? `/currency_exchange_rates/${editId}` : '/currency_exchange_rates/';
      const method = editId ? 'PUT' : 'POST';

      let response;
      if (editId) {
        response = await HTTP.put(url, payload, {
          headers: { Authorization: accessToken },
        });
      } else {
        response = await HTTP.post(url, payload, {
          headers: { Authorization: accessToken },
        });
      }

      if (response.status === 200 || response.status === 201) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: editId ? 'Currency rate updated successfully' : 'Currency rate created successfully',
        });
        onSuccess();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Failed to save currency rate',
        });
      }
    } catch (error) {
      console.error('Error saving currency rate:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save currency rate',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <Toast ref={toast} />
    
        <div className="bg-white rounded-lg shadow-lg currency-form">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {editId ? 'Edit Currency Exchange Rate' : 'Add New Currency Exchange Rate'}
            </h2>
            <p className="text-gray-600">
              {editId ? 'Update the currency exchange rate details below.' : 'Enter the currency exchange rate details below.'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Source Currency */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source Currency <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.source_currency}
                options={currencyOptions}
                onChange={(e) => handleInputChange('source_currency', e.value)}
                placeholder="Select Source Currency"
                className={`w-full custom-dropdown ${errors.source_currency ? 'p-invalid' : ''}`}
                disabled={loading}
                style={{ height: '48px' }}
              />
              {errors.source_currency && (
                <small className="text-red-500 mt-1 block">{errors.source_currency}</small>
              )}
            </div>

            {/* Destination Currency */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination Currency <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.destination_currency}
                options={currencyOptions}
                onChange={(e) => handleInputChange('destination_currency', e.value)}
                placeholder="Select Destination Currency"
                className={`w-full custom-dropdown ${errors.destination_currency ? 'p-invalid' : ''}`}
                disabled={loading}
                style={{ height: '48px' }}
              />
              {errors.destination_currency && (
                <small className="text-red-500 mt-1 block">{errors.destination_currency}</small>
              )}
            </div>

            {/* Exchange Rate */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exchange Rate <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.exchange_rate}
                onChange={(e) => handleInputChange('exchange_rate', e.target.value)}
                placeholder="Enter exchange rate (e.g., 83.50)"
                className={`w-full custom-input ${errors.exchange_rate ? 'p-invalid' : ''}`}
                disabled={loading}
                style={{ height: '48px', fontSize: '14px' }}
                keyfilter="pnum"
                tooltip="Enter a positive number (integers and decimals allowed)"
                tooltipOptions={{ position: 'bottom' }}
              />
              {errors.exchange_rate && (
                <small className="text-red-500 mt-1 block">{errors.exchange_rate}</small>
              )}
              <small className="text-gray-500 mt-1 block">Examples: 83, 83.5, 83.50</small>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  placeholder="Select Start Date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.value)}
                  dateFormat="yy-mm-dd"
                  className={`w-full custom-calendar ${errors.start_date ? 'p-invalid' : ''}`}
                  disabled={loading}
                  style={{ height: '48px' }}
                  inputStyle={{ height: '48px', fontSize: '14px' }}
                />
                {errors.start_date && (
                  <small className="text-red-500 mt-1 block">{errors.start_date}</small>
                )}
              </div>

              {/* End Date */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  placeholder="Select End Date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.value)}
                  dateFormat="yy-mm-dd"
                  className={`w-full custom-calendar ${errors.end_date ? 'p-invalid' : ''}`}
                  disabled={loading || !formData.start_date}
                  style={{ height: '48px' }}
                  inputStyle={{ height: '48px', fontSize: '14px' }}
                  minDate={formData.start_date || undefined}
                />
                {errors.end_date && (
                  <small className="text-red-500 mt-1 block">{errors.end_date}</small>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex !justify-end gap-3 mt-2 pt-4 border-t border-gray-200 w-full" style={{justifyContent: "flex-end"}}>
            <Button
              label="Cancel"
              className="p-button-outlined p-button-secondary custom-button"
              onClick={onCancel}
              disabled={loading}
              style={{ 
                height: '48px', 
                minWidth: '120px',
                borderColor: '#6b7280',
                color: '#6b7280'
              }}
            />
            <Button
              label={editId ? 'Update' : 'Save'}
              className="custom-bg-light-blue"
              onClick={handleSubmit}
              loading={loading}
              style={{ 
                height: '48px', 
                minWidth: '120px',
                color: '#fff'
              }}
            />
          </div>
        </div>


      <style>{`
        .currency-form .form-group {
          position: relative;
        }
        
        .currency-form .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .currency-form .custom-dropdown .p-dropdown {
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        
        .currency-form .custom-dropdown .p-dropdown:hover {
          border-color: #d1d5db;
        }
        
        .currency-form .custom-dropdown .p-dropdown.p-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .currency-form .custom-input .p-inputtext {
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
          padding: 12px 16px;
        }
        
        .currency-form .custom-input .p-inputtext:hover {
          border-color: #d1d5db;
        }
        
        .currency-form .custom-input .p-inputtext:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .currency-form .custom-calendar .p-calendar {
          width: 100%;
        }
        
        .currency-form .custom-calendar .p-calendar .p-inputtext {
          width: 100%;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        
        .currency-form .custom-button .p-button {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .currency-form .custom-button .p-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .currency-form .p-invalid {
          border-color: #ef4444 !important;
        }
        
        .currency-form .p-invalid:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        /* ConfirmDialog Accept Button Styling */
        .p-confirm-dialog-accept {
          background-color: #42A7EC !important;
          border-color: #42A7EC !important;
          color: white !important;
        }
        
        .p-confirm-dialog-accept:hover {
          background-color: #3494d6 !important;
          border-color: #3494d6 !important;
        }
      `}</style>
    </div>
  );
};

export default AddNewCurrencyBudget;