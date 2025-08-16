import { useModalStore } from "../stores/modal";
import Button from "./ui/Button";

export default function ModalRoot() {
    const { isOpen, content, close } = useModalStore();

    if (!isOpen || !content) return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
        }} onClick={close}>
            <div className="card" style={{ width: 420, padding: 20 }} onClick={(e) => e.stopPropagation()}>
                {content.title && (
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>{content.title}</h3>
                )}
                <div style={{ marginBottom: 16 }}>
                    {content.body}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Button variant="ghost" onClick={close}>Cancel</Button>
                    <Button onClick={() => { content.onConfirm?.(); close(); }}>
                        {content.confirmText ?? "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
