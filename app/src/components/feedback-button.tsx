"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function FeedbackButton() {
    const [feedback, setFeedback] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const recipientEmail = "mauro@siempi.ch";
    const emailSubject = "Feedback for Invoice Split Calculator";

    const handleSendFeedback = () => {
        const body = encodeURIComponent(feedback + "\n\n---\nSent from Invoice Split Calculator");
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${body}`;
        window.location.href = mailtoLink;
        setIsOpen(false);
        setFeedback("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    <DialogDescription>
                        Share your thoughts, suggestions, or report issues. This will open your default email client.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full gap-1.5">
                         <Label htmlFor="feedback-message">Your Message</Label>
                         <Textarea
                             id="feedback-message"
                             placeholder="Type your message here..."
                             value={feedback}
                             onChange={(e) => setFeedback(e.target.value)}
                             rows={5}
                         />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSendFeedback} disabled={!feedback.trim()}>
                         Open Email Client
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 
