import { PASS_REQ } from "@/lib/constants";
import { Box, MantineStyleProps, PasswordInput, PasswordInputProps, Popover, Progress, Text, rem } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text c={meets ? "teal" : "red"} style={{ display: "flex", alignItems: "center" }} mt={7} size="sm">
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}{" "}
      <Box ml={10} component="span">
        {label}
      </Box>
    </Text>
  );
}

function getStrength(password: string) {
  let multiplier = password.length > 7 ? 0 : 1;

  PASS_REQ.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (PASS_REQ.length + 1)) * multiplier, 10);
}

export function PasswordStrength(props: {
  pwProps?: MantineStyleProps | PasswordInputProps | undefined;
  extraCheck?: JSX.Element;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  mantineUseForm?: UseFormReturnType<any>;
  mantineUseFormField?: string;
}) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const value = props.mantineUseForm ? props.mantineUseForm.values[props.mantineUseFormField!] : props.value;
  const strength = getStrength(value);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";
  const checksPass = PASS_REQ.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  return (
    <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: "pop" }}>
      <Popover.Target>
        {props.mantineUseForm ? (
          <PasswordInput
            name={props.name || "password"}
            label={props.label || "Password"}
            placeholder={props.placeholder || "Password"}
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
            withAsterisk
            {...props.pwProps}
            {...props.mantineUseForm.getInputProps(props.mantineUseFormField!)}
          />
        ) : (
          <PasswordInput
            name={props.name || "password"}
            label={props.label || "Password"}
            placeholder={props.placeholder || "Password"}
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
            withAsterisk
            value={props.value}
            onChange={(event) => props.setValue!(event.currentTarget.value)}
            {...props.pwProps}
          />
        )}
      </Popover.Target>
      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} mb="xs" />
        <PasswordRequirement label="Memiliki minimal 8 karakter" meets={value.length > 7} />
        {checksPass}
        {props.extraCheck && props.extraCheck}
      </Popover.Dropdown>
    </Popover>
  );
}

export function PasswordStrengthWithConfirmation(props: {
  pwProps?: MantineStyleProps | PasswordInputProps | undefined;
  valuePass?: string;
  setValuePass?: Dispatch<SetStateAction<string>>;
  valuePassConfirmation?: string;
  setValuePassConfirmation?: Dispatch<SetStateAction<string>>;
  mantineUseForm?: UseFormReturnType<any>;
  mantineUseFormFieldPass?: string;
  mantineUseFormFieldPassConfirmation?: string;
}) {
  const [visiblePass, { toggle: togglePass }] = useDisclosure(false);
  const extraCheck = (
    <PasswordRequirement
      label="Konfirmasi password sama dengan password"
      meets={props.valuePass === props.valuePassConfirmation}
    />
  );

  return props.mantineUseForm ? (
    <>
      <PasswordStrength
        pwProps={{ ...props.pwProps, visible: visiblePass, onVisibilityChange: togglePass }}
        mantineUseForm={props.mantineUseForm}
        mantineUseFormField={props.mantineUseFormFieldPass!}
        name="password"
      />
      <PasswordStrength
        pwProps={{ ...props.pwProps, visible: visiblePass, onVisibilityChange: togglePass }}
        extraCheck={extraCheck}
        label="Konfirmasi Password"
        placeholder="Konfirmasi Password"
        mantineUseForm={props.mantineUseForm}
        mantineUseFormField={props.mantineUseFormFieldPassConfirmation!}
        name="passwordConfirmation"
      />
    </>
  ) : (
    <>
      <PasswordStrength
        pwProps={{ ...props.pwProps, visible: visiblePass, onVisibilityChange: togglePass }}
        value={props.valuePass}
        setValue={props.setValuePass}
        name="password"
      />
      <PasswordStrength
        pwProps={{ ...props.pwProps, visible: visiblePass, onVisibilityChange: togglePass }}
        value={props.valuePassConfirmation}
        setValue={props.setValuePassConfirmation}
        extraCheck={extraCheck}
        label="Konfirmasi Password"
        placeholder="Konfirmasi Password"
        name="passwordConfirmation"
      />
    </>
  );
}
