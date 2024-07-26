import { Modal, ButtonToolbar, Button } from 'rsuite';
import RemindIcon from '@rsuite/icons/legacy/Remind';
import { useState, useEffect } from 'react';

interface BaseModalProps {
    openModal?: boolean;
    message?: string;
    onClose: () => void
}
const BaseModalComponent: React.FC<BaseModalProps> = ({ message, openModal, onClose }) => {
    useEffect(() => {
        setOpen(!!openModal)
    }, [openModal])
    const [open, setOpen] = useState(false);

    const handleClose = () => { setOpen(false); onClose() }

    return (
        <>

            <Modal backdrop="static" role="alertdialog" open={open} onClose={handleClose} size="xs">
                <Modal.Body>
                    <RemindIcon style={{ color: '#ffb300', fontSize: 24 }} />
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} appearance="primary">
                        Ok
          </Button>
                    <Button onClick={handleClose} appearance="subtle">
                        Cancel
          </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BaseModalComponent