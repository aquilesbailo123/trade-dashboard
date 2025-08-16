import { create } from "zustand";
import type { ReactNode } from "react";

export type ModalContent = {
    title?: string;
    body?: ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
};

type ModalState = {
    isOpen: boolean;
    content: ModalContent | null;
    open: (content: ModalContent) => void;
    close: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    content: null,
    open: (content) => set({ isOpen: true, content }),
    close: () => set({ isOpen: false, content: null }),
}));
