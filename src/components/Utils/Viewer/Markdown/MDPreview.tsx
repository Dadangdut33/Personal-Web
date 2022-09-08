import { useMantineColorScheme } from "@mantine/core";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MarkdownPreview } from "../../RTE/Markdown/MDE_Import";

interface MDRenderProps {
	content: string;
	className?: string;
}

export const MDPreview = ({ content, className }: MDRenderProps) => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<div data-color-mode={colorScheme}>
			<MarkdownPreview className={className + ` ${colorScheme}`} source={content} remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]} />
		</div>
	);
};
