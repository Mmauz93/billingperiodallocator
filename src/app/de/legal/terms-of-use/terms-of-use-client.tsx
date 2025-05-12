"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TermsOfUseContentProps {
  termsContent: string;
}

export const TermsOfUseContent = ({ termsContent }: TermsOfUseContentProps) => {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div className="custom-markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h4: ({ ...props }) => <h4 className="text-base font-semibold mt-3 mb-1 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            p: ({ ...props }) => <p className="text-sm leading-relaxed text-muted-foreground mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-disc" {...props} />,
            ol: ({ ...props }) => <ol className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-decimal" {...props} />,
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
            strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          }}
        >
          {termsContent}
        </ReactMarkdown>
      </div>
    </article>
  );
}; 
