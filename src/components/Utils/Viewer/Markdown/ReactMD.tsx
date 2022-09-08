import { Button, Group, useMantineColorScheme, Divider } from "@mantine/core";
import { IconLink } from "@tabler/icons";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { synthwave84 } from "react-syntax-highlighter/dist/cjs/styles/prism";
import CopyBtn from "../../Template/CopyBtn";
import Link from "next/link";
import { ReactNode } from "react";

interface MDRenderProps {
	content: string;
	className?: string;
}

const replaceHeader = (text: ReactNode & ReactNode[], size: number) => {
	return (
		<Link href={"#" + String(text).replace(/ /g, "-")}>
			<Group spacing={4} className="subtle-link pointer">
				<IconLink size={size} /> {text}
			</Group>
		</Link>
	);
};

export const ReactMD = ({ className, content }: MDRenderProps) => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<ReactMarkdown
			className={className + ` wmde-markdown ${colorScheme}`}
			remarkPlugins={[gfm]}
			rehypePlugins={[rehypeAutolinkHeadings, rehypeRaw]}
			components={{
				h1: ({ children, ...props }) => {
					return (
						<h1 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 24)}
						</h1>
					);
				},
				h2: ({ children, ...props }) => {
					return (
						<h2 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 20)}
						</h2>
					);
				},
				h3: ({ children, ...props }) => {
					return (
						<h3 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 16)}
						</h3>
					);
				},
				h4: ({ children, ...props }) => {
					return (
						<h4 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 14)}
						</h4>
					);
				},
				h5: ({ children, ...props }) => {
					return (
						<h5 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 12)}
						</h5>
					);
				},
				h6: ({ children, ...props }) => {
					return (
						<h6 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 10)}
						</h6>
					);
				},
				hr: ({ children, ...props }) => {
					return <Divider {...props} my={"sm"} />;
				},
				img: ({ src, alt, children, ...props }) => {
					return (
						<a href={src} target="_blank" rel="noopener noreferrer">
							<picture>
								<img src={src} alt={alt} {...props} />
							</picture>
						</a>
					);
				},
				code({ node, inline, className, children, ...props }) {
					const match = /language-(\w+)/.exec(className || "");
					return !inline && match ? (
						<div className="codeblock-wrapper">
							<Group position="apart">
								<div className="lang-name">
									<Button variant="outline">{match[1]}</Button>
								</div>
								<div className="copy-btn">
									<CopyBtn text={String(children).replace(/\n$/, "")} />
								</div>
							</Group>
							<div style={{ paddingTop: "20px" }}>
								{/* @ts-ignore */}
								<SyntaxHighlighter style={synthwave84} language={match[1]} {...props}>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							</div>
						</div>
					) : (
						<>
							<code>{children}</code>
						</>
					);
				},
			}}
		>
			{content}
		</ReactMarkdown>
	);
};
