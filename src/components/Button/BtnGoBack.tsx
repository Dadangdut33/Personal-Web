"use client";

import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function BtnGoBack() {
  const router = useRouter();
  return (
    <Button size="md" leftSection={<IconArrowLeft size={18} />} variant="subtle" onClick={() => router.back()}>
      Kembali
    </Button>
  );
}
