/* eslint-disable */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@superset-ui/core';
import { Menu } from 'src/components/Menu';
import ExcelExportModal from './ExcelExportModal';

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

  const charts = useSelector((state: any) => state.charts);
  const sliceIds: number[] = useSelector(
    (state: any) => state.dashboardState?.sliceIds || [],
  );

  const handleOpenModal = () => {
    const hasData = sliceIds.some(
      id =>
        ['success', 'rendered'].includes(charts[id]?.chartStatus) &&
        charts[id]?.queriesResponse?.[0]?.data?.length > 0,
    );
    if (!hasData) {
      addDangerToast(
        t(
          'No chart data available to export. Charts may still be loading or have errors.',
        ),
      );
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <Menu.Item key="download-excel" {...rest}>
        <div onClick={handleOpenModal} role="button" tabIndex={0}>
          {text}
        </div>
      </Menu.Item>
      <ExcelExportModal
        show={showModal}
        onHide={() => setShowModal(false)}
        dashboardTitle={dashboardTitle}
        addDangerToast={addDangerToast}
      />
    </>
  );
}
