/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@superset-ui/core';
import { Menu } from 'src/components/Menu';
import Button from 'src/components/Button';
import Checkbox from 'src/components/Checkbox';
import Modal from 'src/components/Modal';
import * as XLSX from 'xlsx';

interface ChartItem {
  id: number;
  name: string;
}

const MAX_SHEET_NAME_LENGTH = 31;
const INVALID_SHEET_CHARS = /[[\]:*?/\\]/g;

function sanitizeSheetName(name: string): string {
  return name.replace(INVALID_SHEET_CHARS, ' ').substring(0, MAX_SHEET_NAME_LENGTH).trim() || 'Sheet';
}

function deduplicateSheetNames(names: string[]): string[] {
  const counts: Record<string, number> = {};
  return names.map(name => {
    if (counts[name] === undefined) {
      counts[name] = 0;
      return name;
    }
    counts[name] += 1;
    const suffix = ` (${counts[name]})`;
    return (name.substring(0, MAX_SHEET_NAME_LENGTH - suffix.length) + suffix);
  });
}

export default function DownloadAsExcel({
  text,
  logEvent,
  dashboardTitle,
  addDangerToast,
  ...rest
}: {
  text: string;
  addDangerToast: Function;
  dashboardTitle: string;
  logEvent?: Function;
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const charts = useSelector((state: any) => state.charts);
  const sliceEntities = useSelector((state: any) => state.sliceEntities);
  const sliceIds: number[] = useSelector((state: any) => state.dashboardState?.sliceIds || []);

  const totalChartCount = sliceIds.length;

  const availableCharts: ChartItem[] = useMemo(() => {
    return sliceIds
      .filter(
        id =>
          charts[id]?.chartStatus === 'success' &&
          charts[id]?.queriesResponse?.[0]?.data?.length > 0,
      )
      .map(id => ({
        id,
        name: sliceEntities?.slices?.[id]?.slice_name || `Chart ${id}`,
      }));
  }, [sliceIds, charts, sliceEntities]);

  const excludedCount = totalChartCount - availableCharts.length;

  const handleOpenModal = () => {
    if (availableCharts.length === 0) {
      addDangerToast(t('No chart data available to export. Charts may still be loading or have errors.'));
      return;
    }
    setSelectedIds(new Set());
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const toggleChart = (chartId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(chartId)) {
        next.delete(chartId);
      } else {
        next.add(chartId);
      }
      return next;
    });
  };

  const allSelected = availableCharts.length > 0 && selectedIds.size === availableCharts.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableCharts.map(c => c.id)));
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const selectedCharts = availableCharts.filter(c => selectedIds.has(c.id));
    const rawNames = selectedCharts.map(c => sanitizeSheetName(c.name));
    const sheetNames = deduplicateSheetNames(rawNames);

    selectedCharts.forEach((chart, idx) => {
      const queryResponse = charts[chart.id].queriesResponse[0];
      const { data, colnames } = queryResponse;

      const wsData = [
        colnames,
        ...data.map((row: any) => colnames.map((col: string) => row[col])),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheetNames[idx]);
    });

    const fileName = `${dashboardTitle || 'Dashboard'}.xlsx`;
    XLSX.writeFile(wb, fileName);
    handleClose();
  };

  return (
    <>
      <Menu.Item key="download-excel" {...rest}>
        <div onClick={handleOpenModal} role="button" tabIndex={0}>
          {text}
        </div>
      </Menu.Item>
      <Modal
        show={showModal}
        onHide={handleClose}
        title={t('Export to Excel')}
        width="480px"
        footer={
          <>
            <Button buttonStyle="secondary" onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              buttonStyle="primary"
              onClick={handleExport}
              disabled={selectedIds.size === 0}
            >
              {t('Export')} ({selectedIds.size})
            </Button>
          </>
        }
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Checkbox checked={allSelected} onChange={toggleAll} />
            <span
              style={{ marginLeft: 8, fontWeight: 600, cursor: 'pointer' }}
              onClick={toggleAll}
            >
              {allSelected ? t('Deselect All') : t('Select All')}
            </span>
            <span style={{ marginLeft: 'auto', color: '#999', fontSize: 13 }}>
              {selectedIds.size} {t('of')} {availableCharts.length} {t('selected')}
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {availableCharts.map(chart => (
              <div
                key={chart.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 10,
                  cursor: 'pointer',
                }}
                onClick={() => toggleChart(chart.id)}
              >
                <Checkbox
                  checked={selectedIds.has(chart.id)}
                  onChange={() => toggleChart(chart.id)}
                />
                <span style={{ marginLeft: 8 }}>{chart.name}</span>
              </div>
            ))}
          </div>
          {excludedCount > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                backgroundColor: '#fff8e1',
                borderRadius: 4,
                fontSize: 13,
                color: '#795548',
              }}
            >
              {excludedCount} {t('chart(s) not shown — still loading or encountered errors.')}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
