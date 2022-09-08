import { Button, Group, useMantineColorScheme } from "@mantine/core";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { MarkdownPreview } from "../../RTE/Markdown/MDE_Import";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { synthwave84 } from "react-syntax-highlighter/dist/cjs/styles/prism";
import CopyBtn from "../../Template/CopyBtn";

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
