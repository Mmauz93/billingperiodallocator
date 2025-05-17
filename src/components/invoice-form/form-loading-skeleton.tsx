"use client";

import {
  ButtonSkeleton,
  CardSkeleton,
  GridSkeleton,
  InputSkeleton,
  SkeletonContainer,
  TextSkeleton,
  ToggleSkeleton,
} from "@/components/ui/skeleton-kit";

export function InvoiceFormSkeleton() {
  return (
    <SkeletonContainer spacing="1.5rem">
      {/* Date fields grid */}
      <GridSkeleton columns={2} gap="1.5rem">
        <InputSkeleton hasLabel={true} labelWidth="40%" />
        <InputSkeleton hasLabel={true} labelWidth="40%" />
      </GridSkeleton>

      {/* Include End Date toggle */}
      <ToggleSkeleton labelWidth="40%" />

      {/* Split Period dropdown */}
      <CardSkeleton height="5rem" hasBorder={true}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <TextSkeleton width="8rem" />
            <TextSkeleton width="16rem" variant="text" />
          </div>
          <InputSkeleton width="7rem" height="2.5rem" hasLabel={false} />
        </div>
      </CardSkeleton>

      {/* Amounts section */}
      <CardSkeleton height="auto" hasBorder={true}>
        <div className="space-y-4">
          <TextSkeleton variant="subheading" width="25%" />
          <TextSkeleton width="60%" />
          
          <div className="mt-4 space-y-4">
            <InputSkeleton hasLabel={true} labelWidth="2rem" />
            <ButtonSkeleton variant="button" width="10rem" className="mt-4" />
          </div>
        </div>
      </CardSkeleton>

      {/* Calculate button */}
      <ButtonSkeleton height="2.75rem" />
    </SkeletonContainer>
  );
}
