import { useCallback, useEffect, useState } from 'react';

import Modal from '../ui/Modal';
import BottomSheet from '../ui/BottomSheet';
import useMediaQuery from '../../utils/useMediaQuery';
import QuickAddFAB from './QuickAddFAB';
import QuickAddMenu from './QuickAddMenu';
import QuickTransactionFlow from './flows/QuickTransactionFlow';
import QuickTransferFlow from './flows/QuickTransferFlow';
import QuickGoalFlow from './flows/QuickGoalFlow';
import QuickRecurrenceFlow from './flows/QuickRecurrenceFlow';

function QuickAddHub({ open, onOpenChange }) {
  const [activeFlow, setActiveFlow] = useState(null);
  const isMobile = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (open) setActiveFlow(null);
  }, [open]);

  const handleOpen = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setActiveFlow(null);
  }, [onOpenChange]);

  const handleSelectFlow = useCallback((flowId) => {
    setActiveFlow(flowId);
  }, []);

  const handleBack = useCallback(() => {
    setActiveFlow(null);
  }, []);

  function renderFlow() {
    switch (activeFlow) {
      case 'INCOME':
      case 'EXPENSE':
      case 'CREDIT_CARD':
        return (
          <QuickTransactionFlow
            flowId={activeFlow}
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      case 'TRANSFER':
        return (
          <QuickTransferFlow
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      case 'RECURRENCE':
        return (
          <QuickRecurrenceFlow
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      case 'GOAL':
        return (
          <QuickGoalFlow
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <QuickAddFAB open={open} onClick={handleOpen} />

      {open && !activeFlow ? (
        isMobile ? (
          <BottomSheet
            isOpen
            title="O que deseja registrar?"
            onClose={handleClose}
          >
            <QuickAddMenu onSelect={handleSelectFlow} />
          </BottomSheet>
        ) : (
          <Modal
            isOpen
            title="O que deseja registrar?"
            description="Escolha o tipo de lançamento que deseja cadastrar"
            onClose={handleClose}
            className="max-w-lg"
          >
            <QuickAddMenu onSelect={handleSelectFlow} />
          </Modal>
        )
      ) : null}

      {activeFlow ? renderFlow() : null}
    </>
  );
}

export default QuickAddHub;
