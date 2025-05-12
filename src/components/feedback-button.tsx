"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/translations"; // Import hook

// TODO: Define API endpoint for feedback submission
// const FEEDBACK_API_ENDPOINT = "/api/feedback";

// Use React.ComponentProps to get the Button component props type
export function FeedbackButton({
  variant = "outline",
  size = "sm",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { t } = useTranslation(); // Initialize hook
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Mounted state
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null); // State for textarea error

  useEffect(() => {
    setIsMounted(true); // Set mounted after initial render
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to allow closing animation
      setTimeout(() => {
        setMessage("");
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmitFeedback = () => { // Changed to simple function, no async needed
    if (!message.trim()) {
      setError(t("FeedbackDialog.errorEmptyMessage"));
      return;
    }
    setError(null);

    // --- Open Mail Client Instead of API Call ---
    const subject = encodeURIComponent(t("FeedbackDialog.emailSubject", "BillSplitter Feedback"));
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:info@siempi.ch?subject=${subject}&body=${body}`;

    try {
      // Attempt to open mail client
      window.location.href = mailtoLink;
      
      // Close the dialog immediately after attempting to open mailto
      setIsOpen(false);

    } catch (mailError) {
      console.error("Failed to open mail client:", mailError);
      // Provide fallback error message if mailto fails (e.g., browser blocks it)
      setError(t("FeedbackDialog.errorOpenEmail", "Could not open email client."));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (error && e.target.value.trim()) {
      setError(null); // Clear error when user starts typing
    }
  };

  // Determine labels based on mounted state
  const triggerLabel = isMounted ? t("FeedbackDialog.sendFeedbackButton") : "Share Your Feedback";
  const dialogTitle = isMounted ? t("FeedbackDialog.dialogTitle") : "Give Feedback";
  const dialogDescription = isMounted ? t("Accessibility.feedbackDescription") : "Share your thoughts...";
  const messageLabel = isMounted ? t("FeedbackDialog.messageLabel") : "Your Message";
  const messagePlaceholder = isMounted ? t("FeedbackDialog.messagePlaceholder") : "Type your message here...";
  const cancelButtonLabel = isMounted ? t("FeedbackDialog.cancelButton") : "Cancel";
  const openEmailButtonLabel = isMounted ? t("FeedbackDialog.openEmailButton") : "Open Email"; // Changed label

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(size !== "icon" ? "gap-2" : "", className)} 
        onClick={() => setIsOpen(true)}
        aria-label={triggerLabel}
        {...props} // Pass remaining props
      >
        <MessageSquare className="size-4" />
        {size !== "icon" && triggerLabel}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="feedback-message">
                  {messageLabel}
                </Label>
                <Textarea
                  placeholder={messagePlaceholder}
                  id="feedback-message"
                  value={message}
                  onChange={handleMessageChange}
                  className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {cancelButtonLabel}
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={handleSubmitFeedback}
                disabled={!message.trim()}
              >
                {openEmailButtonLabel}
              </Button>
            </DialogFooter>
          </>
        </DialogContent>
      </Dialog>
    </>
  );
}
