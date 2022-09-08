import { CopyButton, ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons";

export default function CopyBtn({ text }: { text: string }) {
	return (
		<CopyButton value={text} timeout={2000}>
			{({ copied, copy }) => (
				<Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
					<ActionIcon variant="outline" color={copied ? "teal" : "gray"} onClick={copy}>
						{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
					</ActionIcon>
				</Tooltip>
			)}
		</CopyButton>
	);
}
