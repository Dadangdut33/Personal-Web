"use client";

import { Button as MantineButton } from "@mantine/core";
import { IconArrowLeft, IconHome2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/ui/Button";

export default function BtnGoBack() {
  const router = useRouter();
  return (
    <MantineButton
      size="md"
      leftSection={<IconArrowLeft size={18} />}
      component={BaseButton}
      onClick={() => router.back()}
    >
      Go Back
    </MantineButton>
  );
}

export function BtnGoHome() {
  const router = useRouter();
  return (
    <MantineButton
      size="md"
      leftSection={<IconHome2 size={18} />}
      component={BaseButton}
      variant="default"
      onClick={() => router.push("/")}
    >
      Back to Home
    </MantineButton>
  );
}
