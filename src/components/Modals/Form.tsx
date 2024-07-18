import { useBaseFormMutation } from "@/lib/hooks";
import { Button, Group, LoadingOverlay, MantineSpacing, Modal, ModalBaseProps, ScrollArea } from "@mantine/core";
import { Box, Code, Input, PinInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { generateId } from "lucia";
import { useEffect, useState } from "react";

import { LOADING_OVERLAY_CFG } from "../Form/utils";
import { ConfirmModal } from "./Confirm";

export function BaseFormModal({
  title,
  opened,
  onClose,
  children,
  others,
}: {
  title: string;
  opened: boolean;
  onClose: () => void;
  children: React.ReactNode;
  others?: Omit<ModalBaseProps, "title" | "opened" | "onClose" | "children">;
}) {
  return (
    <Modal
      title={title}
      opened={opened}
      onClose={onClose}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      {...others}
    >
      {children}
    </Modal>
  );
}

export function BaseFormModalBtn({
  closeFn,
  doFn,
  pending,
  justify = "flex-end",
  mt = "lg",
  editText = "save",
  disabledOk = false,
}: {
  closeFn: () => void;
  doFn: () => void;
  pending: boolean;
  justify?: React.CSSProperties["justifyContent"];
  mt?: MantineSpacing;
  editText?: string;
  disabledOk?: boolean;
}) {
  const doModal = ConfirmModal(`Are you sure you want to ${editText} this data?`, () => {}, doFn);
  const cancelModal = ConfirmModal("Apakah you sure you want to cancel any changes?", () => {}, closeFn, {
    confirmProps: { color: "red" },
  });
  return (
    <Group mt={mt} justify={justify}>
      <Button variant="outline" color="red" onClick={cancelModal} loading={pending}>
        Cancel
      </Button>
      <Button variant="filled" color="blue" onClick={doModal} loading={pending} disabled={disabledOk}>
        {editText}
      </Button>
    </Group>
  );
}

// A delete modal just with the code confirmation and delete button
export default function DeleteModal({
  title,
  description,
  opened,
  closeModal,
  doFn,
  selectedData,
}: {
  title: string;
  description?: string;
  doFn: () => Promise<any>;
  selectedData: any;
  opened: boolean;
  closeModal: () => void;
}) {
  const [randomId, setRandomId] = useState("");
  const form = useForm({
    initialValues: {
      code: "",
    },

    validate: {
      code: (value: string) => (value === randomId ? null : "Invalid Code"),
    },
  });

  useEffect(() => {
    form.setValues({
      code: "",
    });
    setRandomId(generateId(10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const mutation = useBaseFormMutation({
    fn: () => doFn(),
    cleanUp: () => {
      closeModal();
    },
  });

  return (
    <BaseFormModal opened={opened} onClose={closeModal} title={`Hapus ${title}`}>
      <Box pos={"relative"}>
        <LoadingOverlay visible={mutation.isPending} {...LOADING_OVERLAY_CFG} />
        <Text ta={"justify"} size="sm" mb={"md"}>
          This action is permanent, deleted data cannot be restored. {description}
        </Text>
        <Input.Wrapper mt={"md"} required>
          <Input.Label>Verification Code</Input.Label>
          <Input.Description>
            Enter this code: <Code>{randomId}</Code>
          </Input.Description>
          <PinInput
            mt={"sm"}
            {...form.getInputProps("code")}
            onChange={(e) => form.setValues({ code: e })}
            type={"alphanumeric"}
            length={10}
            size="xs"
          />
          <Input.Error mt={"sm"}>{form.errors.code}</Input.Error>
        </Input.Wrapper>
      </Box>
      <BaseFormModalBtn
        closeFn={closeModal}
        doFn={() => mutation.mutate(form)}
        pending={mutation.isPending}
        editText="Delete"
      />
    </BaseFormModal>
  );
}
