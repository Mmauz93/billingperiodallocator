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
import { usePathname } from "next/navigation";

// TODO: Define API endpoint for feedback submission
// const FEEDBACK_API_ENDPOINT = "/api/feedback";

// Use React.ComponentProps to get the Button component props type
export function FeedbackButton({
  variant = "outline",
  size = "sm",
  className,
  children, // Accept children to allow language-specific label from parent
  ...props
}: React.ComponentProps<typeof Button> & { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Determine language for initial render based on pathname
  let effectiveLang = 'en'; // Default language
  if (pathname) {
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1 && (pathSegments[1] === 'de' || pathSegments[1] === 'en')) {
      effectiveLang = pathSegments[1];
    }
  }

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

  const handleSubmitFeedback = () => {
    if (!message.trim()) {
      setError(effectiveLang === 'de' ? "Bitte geben Sie eine Nachricht ein." : "Please enter a message.");
      return;
    }
    setError(null);

    // --- Open Mail Client Instead of API Call ---
    const subject = encodeURIComponent(effectiveLang === 'de' ? "BillSplitter Feedback" : "BillSplitter Feedback");
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
      setError(effectiveLang === 'de' ? "E-Mail-Client konnte nicht geöffnet werden." : "Could not open email client.");
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (error && e.target.value.trim()) {
      setError(null); // Clear error when user starts typing
    }
  };

  // Set dialog text based on language regardless of mounted state
  const dialogTitle = effectiveLang === 'de' ? "Feedback geben" : "Give Feedback";
  const dialogDescription = effectiveLang === 'de' 
    ? "Teilen Sie Ihre Gedanken, Vorschläge oder melden Sie Probleme. Dies öffnet Ihren Standard-E-Mail-Client." 
    : "Share your thoughts, suggestions, or report issues. This will open your default email client.";
  const messageLabel = effectiveLang === 'de' ? "Ihre Nachricht" : "Your Message";
  const messagePlaceholder = effectiveLang === 'de' ? "Schreiben Sie Ihre Nachricht hier..." : "Type your message here...";
  const cancelButtonLabel = effectiveLang === 'de' ? "Abbrechen" : "Cancel";
  const openEmailButtonLabel = effectiveLang === 'de' ? "E-Mail-Client öffnen" : "Open Email Client";

  // Default button text if no children provided
  const buttonLabel = children || (effectiveLang === 'de' ? "Feedback teilen" : "Share Your Feedback");

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(size !== "icon" ? "gap-2" : "", className)} 
        onClick={() => setIsOpen(true)}
        aria-label={typeof buttonLabel === 'string' ? buttonLabel : effectiveLang === 'de' ? "Feedback teilen" : "Share Your Feedback"}
        {...props}
      >
        <MessageSquare className="size-4" />
        {size !== "icon" && buttonLabel}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
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
                className="bg-[#0284C7] hover:bg-[#0284C7]/90 text-white"
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
