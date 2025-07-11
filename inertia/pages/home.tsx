import { Box } from '@mantine/core'

import { Button } from '@/components/ui/button'
import PublicLayout from '@/layouts/public'

export default function Home(props: any) {
  return (
    <PublicLayout>
      <div className="max-w-3xl">
        <div>test</div>
        <Button>test btn</Button>
        aaa
        <Box>test</Box>
      </div>
    </PublicLayout>
  )
}
