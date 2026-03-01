/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@superset-ui/core';
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

function getChartIdsInTab(layout: Record<string, any>, tabId: string): number[] {
  const chartIds: number[] = [];
  const traverse = (componentId: string) => {
    const component = layout[componentId];
    if (!component) return;
    if (componentId.startsWith('CHART-') && component.meta?.chartId != null) {
      chartIds.push(component.meta.chartId);
    }
    if (Array.isArray(component.children)) {
      component.children.forEach((childId: string) => traverse(childId));
    }
  };
  traverse(tabId);
  return chartIds;
}

function findTabIdByName(layout: Record<string, any>, tabName: string): string | null {
  for (const key of Object.keys(layout)) {
    if (key.startsWith('TAB-') && layout[key]?.meta?.text === tabName) {
      return key;
    }
  }
  return null;
}

/**
 * Find the deepest active tab starting from a given tab.
 *
 * Strategy:
 * 1. Check directPathToChild for an explicit sub-tab (user clicked one)
 * 2. If not found, walk down through nested TABS containers following the
 *    first child tab at each level (the default active sub-tab)
 * 3. Handles any depth of nesting (tabs → sub-tabs → sub-sub-tabs → ...)
 */
function findDeepestActiveTab(
  layout: Record<string, any>,
  parentTabId: string,
  directPath: string[],
): string {
  // Try directPathToChild — find deepest sub-tab that is a descendant
  const tabsInPath = directPath.filter(id => id.startsWith('TAB-'));
  for (let i = tabsInPath.length - 1; i >= 0; i--) {
    const candidateId = tabsInPath[i];
    if (candidateId === parentTabId) break;
    const component = layout[candidateId];
    if (component?.parents?.includes(parentTabId)) {
      return candidateId;
    }
  }

  // directPathToChild didn't have a sub-tab — walk down the default path
  // by following the first child of each nested TABS container
  let currentTabId = parentTabId;
  while (true) {
    const tab = layout[currentTabId];
    if (!tab?.children) break;
    // Find a TABS container among this tab's children
    const nestedTabsId = tab.children.find((id: string) => id.startsWith('TABS-'));
    if (!nestedTabsId) break;
    const nestedTabs = layout[nestedTabsId];
    if (!nestedTabs?.children?.length) break;
    // Use the first child TAB as the default active sub-tab
    currentTabId = nestedTabs.children[0];
  }
  return currentTabId;
}

interface ExcelExportModalProps {
  show: boolean;
  onHide: () => void;
  dashboardTitle?: string;
  addDangerToast?: Function;
  activeTabName?: string;
}

export default function ExcelExportModal({
  show,
  onHide,
  dashboardTitle,
  addDangerToast,
  activeTabName,
}: ExcelExportModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const charts = useSelector((state: any) => state.charts);
  const sliceEntities = useSelector((state: any) => state.sliceEntities);
  const sliceIds: number[] = useSelector((state: any) => state.dashboardState?.sliceIds || []);
  const dashboardLayout = useSelector((state: any) => state.dashboardLayout?.present);
  const directPathToChild: string[] = useSelector(
    (state: any) => state.dashboardState?.directPathToChild || [],
  );

  // Get chart IDs for the deepest active tab/sub-tab.
  // Uses directPathToChild for explicit sub-tab clicks, then falls back to
  // walking down through nested TABS containers following the default first child.
  const activeTabChartIds = useMemo(() => {
    if (!dashboardLayout || !activeTabName) return [];

    const parentTabId = findTabIdByName(dashboardLayout, activeTabName);
    if (!parentTabId) return [];

    const deepestTabId = findDeepestActiveTab(dashboardLayout, parentTabId, directPathToChild);
    return getChartIdsInTab(dashboardLayout, deepestTabId);
  }, [dashboardLayout, activeTabName, directPathToChild]);

  // Use active tab charts if found, otherwise show all loaded charts
  const tabChartIds = activeTabChartIds.length > 0 ? activeTabChartIds : sliceIds;

  const availableCharts: ChartItem[] = useMemo(() => {
    return tabChartIds
      .filter(
        id =>
          ['success', 'rendered'].includes(charts[id]?.chartStatus) &&
          charts[id]?.queriesResponse?.[0]?.data?.length > 0,
      )
      .map(id => ({
        id,
        name: sliceEntities?.slices?.[id]?.slice_name || `Chart ${id}`,
      }));
  }, [tabChartIds, charts, sliceEntities]);

  const excludedCount = tabChartIds.length - availableCharts.length;

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
    onHide();
  };

  // Reset selection when modal opens
  React.useEffect(() => {
    if (show) {
      setSelectedIds(new Set());
    }
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={t('Multi Chart Excel Export')}
      width="480px"
      footer={
        <>
          <Button buttonStyle="secondary" onClick={onHide}>
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
        {availableCharts.length === 0 ? (
          <div style={{ padding: '16px 0', color: '#999', textAlign: 'center' }}>
            {t('No chart data available. Charts may still be loading.')}
          </div>
        ) : (
          <>
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
                    onChange={() => {}}
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
          </>
        )}
      </div>
    </Modal>
  );
}
