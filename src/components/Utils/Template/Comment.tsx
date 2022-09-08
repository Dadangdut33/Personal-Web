import Giscus from "@giscus/react";

export default function Comment({ theme }: { theme: string }) {
	return (
		<Giscus
			repo="dadangdut33/Personal-Web"
			repoId="R_kgDOH7PtOA"
			category="General"
			categoryId="DIC_kwDOH7PtOM4CRMHS"
			mapping="pathname"
			reactionsEnabled="1"
			emitMetadata="0"
			inputPosition="top"
			theme={theme}
		/>
	);
}
