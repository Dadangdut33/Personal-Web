import BtnUpdateGroup from "@/components/Button/BtnUpdateGroup";
import { ConfirmAddModal, ConfirmDeleteModal, ConfirmResetModal } from "@/components/Modals/Confirm";
import { useBaseFormMutation } from "@/lib/hooks";
import { ApiReturn, UpdateCardFn } from "@/lib/types";
import { LoadingOverlay, PasswordInput, Stack, TextInput, Textarea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTimeout } from "@mantine/hooks";
import { IconLock } from "@tabler/icons-react";
import { useState } from "react";

import { CardInput, CardInputBody, CardInputFooter } from "./CardInput";
import { PasswordStrengthWithConfirmation } from "./PasswordWithStrength";
import { LoadingOverlayConfig } from "./utils";

export default function UpdateCard({
  header,
  desc,
  subDesc,
  footerDesc,
  InputElement,
  SubmitElement,
  withFooter = true,
}: {
  header: string;
  desc: string;
  subDesc?: string;
  withFooter?: boolean;
  footerDesc?: string;
  InputElement: JSX.Element;
  SubmitElement?: JSX.Element;
}) {
  return (
    <CardInput
      params={{
        header: header,
        description: desc,
        subDesc: subDesc,
      }}
    >
      <CardInputBody>{InputElement}</CardInputBody>
      {withFooter && <CardInputFooter description={footerDesc || ""}>{SubmitElement}</CardInputFooter>}
    </CardInput>
  );
}

export function UpdateCardWithAction({
  header,
  desc,
  subDesc,
  footerDesc,
  mutateFn,
  form,
  formField,
  resetOnSuccess = true,
  withRemove = false,
  removeFn,
  useTextarea = false,
  usePasswordFields = false,
  withOldPassword = true,
}: {
  header: string;
  desc: string;
  subDesc?: string;
  footerDesc?: string;
  mutateFn: UpdateCardFn;
  form: UseFormReturnType<any>;
  formField: string;
  resetOnSuccess?: boolean;
  withRemove?: boolean;
  removeFn?: () => Promise<any>;
  useTextarea?: boolean;
  usePasswordFields?: boolean;
  withOldPassword?: boolean;
}) {
  const [state, setState] = useState<ApiReturn>({ success: 0, message: "" });
  const [edit, setEdit] = useState(false);
  const { start: startResetState, clear } = useTimeout(() => {
    setState({ success: 0, message: "" });
  }, 7000);

  const mutation = useBaseFormMutation({
    fn: (data) => mutateFn(data!),
    cleanUp: (data) => {
      if (!data) return;
      if (data.success && resetOnSuccess) form.reset();
      setState(data);
      startResetState();
    },
  });

  const saveModal = ConfirmAddModal(
    () => {},
    async () => mutation.mutate(form),
    "data " + formField
  );

  const resetModal = ConfirmResetModal(
    () => {}, // do nothing
    () => {
      setEdit(false);
      form.reset();
    },
    "/ cancel perubahan untuk data " + formField
  );

  const deleteMutation = useBaseFormMutation({
    fn: () => removeFn!(),
    cleanUp: (data) => {
      clear();
      if (!data) return;
      form.setValues({ [formField]: "" });
      setState(data);
      startResetState();
    },
  });

  const deleteDataModal = ConfirmDeleteModal(
    () => {},
    async () => deleteMutation.mutate(null),
    "data " + formField
  );

  return (
    <UpdateCard
      header={header}
      desc={desc}
      subDesc={subDesc}
      InputElement={
        <Stack gap={"md"} pos={"relative"}>
          <LoadingOverlay visible={mutation.isPending || deleteMutation.isPending} {...LoadingOverlayConfig} />
          {useTextarea ? (
            <Textarea {...form.getInputProps(formField)} radius={"md"} disabled={!edit} minRows={4} autosize />
          ) : usePasswordFields ? (
            <>
              {withOldPassword && (
                <PasswordInput
                  {...form.getInputProps(`${formField}Old`)}
                  placeholder="Old Password"
                  label="Old Password"
                  radius={"md"}
                  disabled={!edit}
                />
              )}
              <PasswordStrengthWithConfirmation
                pwProps={{ leftSection: <IconLock />, disabled: !edit }}
                mantineUseForm={form}
                mantineUseFormFieldPass={`${formField}`}
                mantineUseFormFieldPassConfirmation={`${formField}Confirmation`}
              />
            </>
          ) : (
            <TextInput {...form.getInputProps(formField)} radius={"md"} disabled={!edit} />
          )}
        </Stack>
      }
      SubmitElement={
        <BtnUpdateGroup
          edit={edit}
          enableEdit={() => setEdit(true)}
          onSave={saveModal}
          onReset={resetModal}
          onRemove={withRemove ? deleteDataModal : undefined}
          loadingSave={mutation.isPending}
          loadingReset={mutation.isPending}
          loadingRemove={mutation.isPending}
        />
      }
      footerDesc={state.message?.length ? state.message : footerDesc}
    />
  );
}
