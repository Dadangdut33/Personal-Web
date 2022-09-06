import { Breadcrumbs, Skeleton, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { NoScrollLink } from "../Looks/NoScrollLink";

export const BreadCrumb = ({ mTop }: { mTop: string | number }) => {
	const router = useRouter();
	const [links, setLinks] = useState<string[]>([]);
	const getPath = () => {
		return router.asPath
			.split("?")[0]
			.split("#")[0]
			.split("/")
			.slice(1)
			.map((item) => {
				return item.charAt(0).toUpperCase() + item.slice(1);
			})
			.filter((item) => item);
	};

	useEffect(() => {
		setLinks(getPath());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Breadcrumbs mt={mTop}>
			{links.length > 0 ? (
				links.map((item, index) => {
					return (
						<NoScrollLink
							key={index}
							href={
								"/" +
								links
									.slice(0, index + 1)
									.join("/")
									.toLowerCase()
							}
						>
							<a>
								<Text variant="link">{item}</Text>
							</a>
						</NoScrollLink>
					);
				})
			) : (
				<Skeleton visible={links.length < 1} mt={links.length < 1 ? 6 : 0} width={130} height={19} />
			)}
		</Breadcrumbs>
	);
};
