import React, { useState, useEffect } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import AddNewCurrencyBudget from './AddNewCurrencyBudget';
import { HTTP } from "../../CsightCommon/config/http-common";
import { useAuth } from "../../CsightCommon/context/AuthContext";
import { useToast } from "../../CsightCommon/context/ToastContext";
import { ProgressSpinner } from 'primereact/progressspinner';

interface CurrencyExchangeRateBudgetProps {
    visible: boolean;
    onHide: () => void;
}

interface CurrencyRate {
    id: number;
    source_currency: string;
    destination_currency: string;
    exchange_rate: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

interface FilterState {
    source_currency: string;
    destination_currency: string;
    start_date: Date;
    end_date: Date;
}

const CurrencyExchangeRateBudget: React.FC<CurrencyExchangeRateBudgetProps> = ({ visible, onHide }) => {
    const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const toast = useRef<Toast>(null);
    const { accessToken } = useAuth();
    const { showToast } = useToast();

    // Filter states with default values
    const [filters, setFilters] = useState<FilterState>({
        source_currency: 'USD',
        destination_currency: 'INR',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

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
        if (visible) {
            setLoading(true);
            fetchCurrencyRates();
        }
    }, [visible, filters]);

    const fetchCurrencyRates = async () => {
        try {
            // const params = new URLSearchParams({
            //     source_currency: filters.source_currency,
            //     destination_currency: filters.destination_currency,
            //     start_date: formatDate(filters.start_date),
            //     end_date: formatDate(filters.end_date),
            // });

            const response = await HTTP.get(`/currency_exchange_rates/`, {
                headers: { Authorization: accessToken },
            });

            if (response.status === 200 && response.data.result) {
                setCurrencyRates(response.data.result || []);
                setTotalRecords(response.data.count || 0);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch currency rates',
                });
            }
        } catch (error) {
            console.error('Error fetching currency rates:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch currency rates',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEdit = (id: number) => {
        setEditingId(id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this currency exchange rate?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await HTTP.delete(`/currency_exchange_rates/${id}`, {
                        headers: { Authorization: accessToken },
                    });

                    if (response.status === 200 || response.status === 201) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Currency rate deleted successfully',
                        });
                        fetchCurrencyRates();
                    } else {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete currency rate',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting currency rate:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete currency rate',
                    });
                }
            }
        });
    };

    const handleFormSuccess = () => {
        setShowAddForm(false);
        setEditingId(null);
        fetchCurrencyRates();
        toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: editingId ? 'Currency rate updated successfully' : 'Currency rate created successfully',
        });
    };

    const handleFormCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
    };

    const actionBodyTemplate = (rowData: CurrencyRate) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    style={{padding: "0", width: "30px", height: "30px", fontSize: "10px", color: "#fff"}}
                    className="custom-bg-green p-button-rounded"
                    onClick={() => handleEdit(rowData.id)}
                    tooltip="Edit"
                />
                <Button
                    icon="pi pi-trash"
                    style={{ backgroundColor: "#f04437", border: "none", color: "#fff",padding: "0", width: "30px", height: "30px", fontSize: "10px" }}
                    className="p-button-rounded"
                    onClick={() => handleDelete(rowData.id)}
                    tooltip="Delete"
                />
            </div>
        );
    };

    const exchangeRateBodyTemplate = (rowData: CurrencyRate) => {
        return rowData?.exchange_rate?.toFixed(2) || 0;
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

    const dateBodyTemplate = (rowData: CurrencyRate, field: string) => {
        const date = new Date(rowData[field as keyof CurrencyRate] as string);
        return formatDate(date);
    };

    return (
        <Sidebar
            visible={visible}
            position="right"
            onHide={onHide}
            style={{ width:  showAddForm? '50vw' :'70vw' }}
            dismissable={false}
        >

            <ConfirmDialog/>



                {/* Content */}
                <div className="overflow-hidden w-full h-full flex flex-col justify-center items-center">
                    {showAddForm ? (
                        <div className="h-full p-4 w-full flex flex-col ">
                            <AddNewCurrencyBudget
                                editId={editingId}
                                onSuccess={handleFormSuccess}
                                onCancel={handleFormCancel}
                            />
                        </div>
                    ) : (
                        <div className="h-full bg-white w-full !max-w-[60vw]">
                        <Toast ref={toast} />
        
                        {/* Header */}
                        <div className="flex align-items-center justify-content-between w-full mb-2 horizontal-border pb-2">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Currency Exchange Rate
                            </h2>
                            <Button
                                label="Currency Rate"
                                className="custom-bg-light-blue !h-[20px] !w-[20px]"
                                icon="pi pi-plus"
                                onClick={() => setShowAddForm(true)}
                            />
                        </div>
                        <div className="h-full w-full">
                            {/* Data Table Container */}
                            <div className=" p-4 overflow-hidden">
                                <div className="h-full">
                                    {
                                        loading ? <div className="flex justify-content-center align-items-center !h-full !w-full align-self-center min-h-[200px]"> 
                                        <div className="flex flex-column align-items-center gap-3">
                                            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                                            <p className="text-gray-500 font-bold">Loading...</p>
                                        </div>
                                    </div> :
                                    <DataTable
                                        value={currencyRates}
                                        // loading={loading}
                                        scrollable
                                        scrollHeight="100%"
                                        tableStyle={{ minWidth: "60rem" }}
                                        className="dashboard-table-update budget-table h-full"
                                        emptyMessage={
                                            <div className="flex justify-content-center align-items-center !h-full !w-full align-self-center min-h-[200px]"> 
                                                <p className="text-gray-500 font-bold">No currency exchange rates found</p>
                                            </div>
                                        }
                                    >
                                        <Column
                                            field="source_currency"
                                            header="Source Currency"
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            field="destination_currency"
                                            header="Destination Currency"
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            field="exchange_rate"
                                            header="Exchange Rate"
                                            body={exchangeRateBodyTemplate}
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            field="start_date"
                                            header="Start Date"
                                            body={(rowData) => dateBodyTemplate(rowData, 'start_date')}
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            field="end_date"
                                            header="End Date"
                                            body={(rowData) => dateBodyTemplate(rowData, 'end_date')}
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            field="created_at"
                                            header="Created At"
                                            body={(rowData) => dateBodyTemplate(rowData, 'created_at')}
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        <Column
                                            exportable={false}
                                            body={actionBodyTemplate}
                                            header="Action"
                                            headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                                        />
                                        </DataTable>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
        
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
        </Sidebar>
    );
};

export default CurrencyExchangeRateBudget;