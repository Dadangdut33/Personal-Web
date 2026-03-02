import { Box, Combobox, Group, InputBase, Loader, Text, useCombobox } from '@mantine/core'
import { useIntersection } from '@mantine/hooks'
import * as TablerIcons from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'

const ALL_ICON_NAMES = Object.keys(TablerIcons)
  .filter((name) => name.startsWith('Icon'))
  .sort()

const STEP = 50 // How many icons to add per "page"

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setVisibleCount(STEP) // Reset count when closed to save memory
    },
  })

  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(STEP)

  // Filter the list based on search
  const filteredIcons = useMemo(() => {
    const s = search.toLowerCase().trim()
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(s))
  }, [search])

  // Slice the list based on current visibility scroll
  const visibleIcons = filteredIcons.slice(0, visibleCount)

  // Setup Intersection Observer for the "Sentinel"
  const { ref, entry } = useIntersection({
    root: null, // use the dropdown as the viewport (handled by Mantine internally)
    threshold: 0.5,
  })

  // Load more when sentinel is hit
  useEffect(() => {
    if (entry?.isIntersecting && visibleCount < filteredIcons.length) {
      setVisibleCount((prev) => prev + STEP)
    }
  }, [entry?.isIntersecting, filteredIcons.length])

  // Reset pagination when searching
  useEffect(() => {
    setVisibleCount(STEP)
  }, [search])

  const options = visibleIcons.map((name) => {
    const Icon = (TablerIcons as any)[name]
    return (
      <Combobox.Option value={name} key={name}>
        <Group gap="sm">
          <Icon size={18} stroke={1.5} />
          <Text size="sm">{name.replace('Icon', '')}</Text>
        </Group>
      </Combobox.Option>
    )
  })

  const SelectedIcon = (TablerIcons as any)[value] || TablerIcons.IconQuestionMark

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange(val)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          label="Select Icon"
          component="button"
          type="button"
          pointer
          leftSection={<SelectedIcon size={18} />}
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
        >
          {value.replace('Icon', '') || <>Pick an icon</>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search 5,000+ icons..."
        />
        <Combobox.Options mah={300} style={{ overflowY: 'auto' }}>
          {options}

          {/* THE SENTINEL: This invisible div triggers the next load */}
          {visibleCount < filteredIcons.length && (
            <Box ref={ref} p="xs" style={{ display: 'flex', justifyContent: 'center' }}>
              <Loader size="sm" variant="dots" />
            </Box>
          )}

          {options.length === 0 && <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
