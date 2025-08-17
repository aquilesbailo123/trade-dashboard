import { useModalStore } from "../../stores/modal";
import Button from "../ui/Button/Button";
import "./ModalRoot.css";

export default function ModalRoot() {
    const { isOpen, content, close } = useModalStore();

    if (!isOpen || !content) return null;

    return (
        <div className="modalroot_container" onClick={close}>
            <div className="modalroot_backdrop" />
            <div 
                className="modalroot_content" 
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modalroot_close_btn" onClick={close}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                
                {content.title && (
                    <div className="modalroot_header">
                        <h3 className="modalroot_title">{content.title}</h3>
                    </div>
                )}
                
                <div className="modalroot_body">
                    {content.body}
                </div>
                
                <div className="modalroot_footer">
                    <Button variant="ghost" onClick={close}>Cancel</Button>
                    <Button onClick={() => { content.onConfirm?.(); close(); }}>
                        {content.confirmText ?? "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
