"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type ActionSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function ActionSubmitButton({ label, pendingLabel = "Memproses...", className }: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}
