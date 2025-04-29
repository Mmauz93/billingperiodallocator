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
import { useTranslation } from "react-i18next"; // Import hook

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const [submitSuccess, setSubmitSuccess] = useState(false); // Add success state

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
        setIsSubmitting(false);
        setSubmitSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmitFeedback = async () => {
    if (!message.trim()) {
      setError(t("FeedbackDialog.errorEmptyMessage"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setSubmitSuccess(false); // Reset success state on new submission

    try {
      // --- TODO: Replace with actual API call ---
      console.log("Submitting feedback:", message);
      // Example:
      // const response = await fetch(FEEDBACK_API_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message }),
      // });
      // if (!response.ok) {
      //   throw new Error(t("FeedbackDialog.errorSubmit") || 'Failed to submit feedback');
      // }
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // --- End TODO ---

      setSubmitSuccess(true);
      // Optionally close dialog after a short delay on success
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

    } catch (submitError) {
      console.error("Feedback submission error:", submitError);
      setError(submitError instanceof Error ? submitError.message : t("FeedbackDialog.errorSubmit"));
    } finally {
      setIsSubmitting(false);
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
  const submitButtonLabel = isMounted ? t("FeedbackDialog.submitButton") : "Send Feedback";
  const submittingButtonLabel = isMounted ? t("FeedbackDialog.submittingButton") : "Sending...";
  const successMessage = isMounted ? t("FeedbackDialog.successMessage") : "Feedback sent successfully!";

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
              {submitSuccess ? successMessage : dialogDescription}
            </DialogDescription>
          </DialogHeader>
          {!submitSuccess && (
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
                    error={error ?? undefined}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    {cancelButtonLabel}
                  </Button>
                </DialogClose>
                <Button 
                  type="button" 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || !message.trim()} // Disable if submitting or message is empty
                >
                  {isSubmitting ? submittingButtonLabel : submitButtonLabel}
                </Button>
              </DialogFooter>
            </>
          )}
          {submitSuccess && (
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('Common.close')}</Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
