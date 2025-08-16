import { useModalStore } from "../../stores/modal";
import Button from "../ui/Button";
import "./ModalRoot.css";

export default function ModalRoot() {
    const { isOpen, content, close } = useModalStore();

    if (!isOpen || !content) return null;

    return (
        <div className="modalRoot" onClick={close}>
            <div className="modalRoot__backdrop" />
            <div 
                className="modalRoot__container" 
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modalRoot__closeBtn" onClick={close}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                
                {content.title && (
                    <div className="modalRoot__header">
                        <h3 className="modalRoot__title">{content.title}</h3>
                    </div>
                )}
                
                <div className="modalRoot__body">
                    {content.body}
                </div>
                
                <div className="modalRoot__footer">
                    <Button variant="ghost" onClick={close}>Cancel</Button>
                    <Button onClick={() => { content.onConfirm?.(); close(); }}>
                        {content.confirmText ?? "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
