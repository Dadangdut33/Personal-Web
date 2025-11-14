import { Box, Popover, Text, rem } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { PASS_REQ } from '~/lib/constants'

export default function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}{' '}
      <Box ml={10} component="span">
        {label}
      </Box>
    </Text>
  )
}

export function getPasswordStrength(password: string) {
  let multiplier = password.length > 8 ? 0 : 1

  PASS_REQ.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1
    }
  })

  return Math.max(100 - (100 / (PASS_REQ.length + 1)) * multiplier, 10)
}

export function PasswordPopover({
  input,
  popoverOpened,
  setPopoverOpened,
  popoverDropdown,
}: {
  input: React.ReactNode
  popoverOpened: boolean
  setPopoverOpened: (value: boolean) => void
  popoverDropdown: React.ReactNode
}) {
  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      width="target"
      transitionProps={{ transition: 'pop' }}
    >
      <Popover.Target>
        <div
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
          className="space-y-4 flex flex-col"
        >
          {input}
        </div>
      </Popover.Target>
      {popoverDropdown}
    </Popover>
  )
}
