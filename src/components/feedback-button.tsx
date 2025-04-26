"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTranslation } from 'react-i18next'; // Import hook

// Replace with your actual email address
const FEEDBACK_EMAIL = "siempi@siempi.ch"; 

export function FeedbackButton() {
    const { t } = useTranslation(); // Initialize hook
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    const handleOpenEmailClient = () => {
        const subject = encodeURIComponent(t('FeedbackDialog.dialogTitle')); // Use translated title as subject
        const body = encodeURIComponent(message);
        window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
        setIsOpen(false);
        setMessage("");
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                 <MessageSquare className="mr-2 h-4 w-4" /> {t('FeedbackDialog.sendFeedbackButton')} {/* Translate button text */}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                         {/* Translate dialog title */}
                        <DialogTitle>{t('FeedbackDialog.dialogTitle')}</DialogTitle>
                         {/* Translate dialog description - Using Accessibility key */}
                        <DialogDescription>{t('Accessibility.feedbackDescription')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full gap-1.5">
                             {/* Translate message label */}
                             <Label htmlFor="message">{t('FeedbackDialog.messageLabel')}</Label>
                             <Textarea 
                                placeholder={t('FeedbackDialog.messagePlaceholder')} // Translate placeholder
                                id="message" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                             />
                        </div>
                    </div>
                    <DialogFooter>
                         {/* Translate cancel button */}
                         <DialogClose asChild>
                             <Button type="button" variant="outline">{t('FeedbackDialog.cancelButton')}</Button>
                         </DialogClose>
                         {/* Translate open email button */}
                        <Button type="button" onClick={handleOpenEmailClient}>{t('FeedbackDialog.openEmailButton')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
