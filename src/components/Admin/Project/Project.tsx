import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnstyledButton, Group, Text, TextInput, Tooltip, ActionIcon, Tabs, Collapse, MultiSelect } from "@mantine/core";
import { keys } from "@mantine/utils";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconTags, IconLetterA, IconLicense, IconDeviceWatch, IconBrandGithub, IconWorld, IconDownload } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IProject, validProjectSort, ProjectSort } from "../../../interfaces/db";
import { actionPrompt, fillDataPage, fillDataAll, handleAdminTabChange, handleInputQueryChange, handleSelectQueryChange } from "../../../helper/admin";
import { formatDateWithTz } from "../../../helper/global";
import { Th, useTableStyles } from "../../Utils/Dashboard";
import { TableView } from "../Reusable/TableView";

export const iconMap: any = {
	github: IconBrandGithub,
	link: IconWorld,
	download: IconDownload,
};

export const Project: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "project";

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-project", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchTitle, setSearchTitle] = useState("");
	const [searchDescription, setSearchDescription] = useState("");
	const [searchTags, setSearchTags] = useState<string[]>([]);
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IProject[]>([]);
	const [dataPage, setDataPage] = useState<IProject[]>([]);
	const [sortBy, setSortBy] = useState<validProjectSort | null>(null);
	const [availableTags, setAvailableTags] = useState<string[]>([]);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataPage, setLoadingDataPage] = useState(true);
	const [loadingDataAll, setLoadingDataAll] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
	// handler
	const handleDelete = (id: string) => actionPrompt({ context: "project", _id: id, api_url, setDataPage, setDataAllPage });
	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IProject, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.description.toLowerCase().includes(query.toLowerCase()) ||
			item.tags.join(", ").toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return (
			tabIndex !== 2 &&
			dataAllPage.length > 0 &&
			searchTags.length > 0 &&
			searchTags[0] !== undefined &&
			(searchAll !== "" || searchTitle !== "" || searchDescription !== "" || searchCreatedAt !== "")
		);
	};

	const searchData = (dataPage: IProject[], dataAll: IProject[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchTitle !== "") dataPage = dataPage.filter((item) => item.title.toLowerCase().includes(searchTitle.toLowerCase()));
			if (searchDescription !== "") dataPage = dataPage.filter((item) => item.description.toLowerCase().includes(searchDescription.toLowerCase()));
			if (searchTags.length > 0 && searchTags[0]) dataPage = dataPage.filter((item) => item.tags?.some((tag) => searchTags.includes(tag)));
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validProjectSort | null, dataPage: IProject[], dataAll: IProject[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: ProjectSort = {
			title: (a: IProject, b: IProject) => a.title.localeCompare(b.title),
			description: (a: IProject, b: IProject) => a.description.localeCompare(b.description),
			tags: (a: IProject, b: IProject) => a.tags.join(", ").localeCompare(b.tags.join(", ")),
			createdAt: (a: IProject, b: IProject) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
		};

		// sort
		let sortedData = dataPage.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData, dataAll);
	};

	// -----------------------------------------------------------
	// delete
	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setCurPage(params.get("page") ? parseInt(params.get("page") || "1") : 1);
		setSearchAll(params.get("qAll") || "");
		setSearchTitle(params.get("title") || "");
		setSearchDescription(params.get("description") || "");
		setSearchTags([params.get("tags")!] || []);
		setSearchCreatedAt(params.get("createdAt") || "");
		setTabIndex(parseInt(params.get("tab") || "0"));
	};

	const fillExtraData = (data: IProject[]) => {
		// get tags
		const tagsOnly = data.reduce((acc: string[], item) => [...acc, ...(item.tags || [])], []);
		const tagsOnlyUnique = tagsOnly.filter((item, index) => tagsOnly.indexOf(item) === index);
		setAvailableTags(tagsOnlyUnique);
	};

	useEffect(() => {
		fetchUrlParams();
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
		fillDataPage(api_url, perPage, curPage, setLoadingDataPage, setCurPage, setPages, setDataPage);
		fillDataAll(api_url, setLoadingDataAll, setDataAllPage, fillExtraData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TableView
				{...props}
				api_url={api_url}
				title={"Projects"}
				isSearching={isSearching()}
				router={router}
				// loading
				loadingDataAll={loadingDataAll}
				loadingDataPage={loadingDataPage}
				setLoadingDataAll={setLoadingDataAll}
				setLoadingDataPage={setLoadingDataPage}
				// page
				pages={pages}
				curPage={curPage}
				perPage={perPage}
				setCurPage={setCurPage}
				setPerPage={setPerPage}
				setPages={setPages}
				// data
				setDataPage={setDataPage}
				setDataAllPage={setDataAllPage}
				// tabs
				tabIndex={tabIndex}
				handle_tabs_change={(val) => handleAdminTabChange(val, setTabIndex, router)}
				tabs_header_length={2}
				tabs_element_header={() => (
					<>
						<Tabs.Tab value="0" color="green">
							Search
						</Tabs.Tab>
						<Tabs.Tab value="1" color="lime">
							Advanced Search
						</Tabs.Tab>
					</>
				)}
				tabs_element_body={() => (
					<>
						<Tabs.Panel value="0" pt="xs">
							<Collapse in={tabIndex === 0}>
								<Text color="dimmed">Quick search by any field</Text>
								<TextInput
									placeholder="Search by any field"
									name="qAll"
									mb="md"
									icon={<IconSearch size={14} stroke={1.5} />}
									value={searchAll}
									onChange={(e) => handleInputQueryChange(e, setSearchAll, e.target.name, router)}
									mt={16}
								/>
							</Collapse>
						</Tabs.Panel>

						<Tabs.Panel value="1" pt="xs" className="dash-textinput-gap">
							<Collapse in={tabIndex === 1}>
								<Text color="dimmed">Search more accurately by searching for each field</Text>

								<TextInput
									placeholder="Search by title field"
									name="title"
									label="Title"
									icon={<IconLetterA size={14} stroke={1.5} />}
									value={searchTitle}
									onChange={(e) => handleInputQueryChange(e, setSearchTitle, e.target.name, router)}
									mt={16}
								/>
								<TextInput
									placeholder="Search by description field"
									name="description"
									label="Description"
									icon={<IconLicense size={14} stroke={1.5} />}
									value={searchDescription}
									onChange={(e) => handleInputQueryChange(e, setSearchDescription, e.target.name, router)}
									mt={8}
								/>
								<MultiSelect
									label="Tags"
									name="tags"
									placeholder="Search by tags field"
									icon={<IconTags size={14} stroke={1.5} />}
									value={searchTags}
									onChange={(e) => handleSelectQueryChange(e.join(" "), setSearchTags, "tags", router, e)}
									data={availableTags}
									mt={8}
									searchable
								/>
								<TextInput
									placeholder="Search by createdAt field"
									label="Created At"
									name="createdAt"
									icon={<IconDeviceWatch size={14} stroke={1.5} />}
									value={searchCreatedAt}
									onChange={(e) => handleInputQueryChange(e, setSearchCreatedAt, e.target.name, router)}
									mt={8}
								/>
							</Collapse>
						</Tabs.Panel>
					</>
				)}
				// table
				th_element={() => (
					<>
						<Th
							classes={classes}
							sorted={sortBy === "title"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "title") setReverseSortDirection(!reverseSortDirection);
								setSortBy("title");
							}}
							width="15%"
						>
							Title
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "description"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "description") setReverseSortDirection(!reverseSortDirection);
								setSortBy("description");
							}}
							width="30%"
						>
							Description
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "tags"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "tags") setReverseSortDirection(!reverseSortDirection);
								setSortBy("tags");
							}}
							width="15%"
						>
							Tags
						</Th>
						<th className={classes.th} style={{ width: "15%" }}>
							<UnstyledButton className={classes.control}>
								<Group position="apart">
									<Text weight={500} size="sm">
										Links
									</Text>
								</Group>
							</UnstyledButton>
						</th>
						<Th
							classes={classes}
							sorted={sortBy === "createdAt"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "createdAt") setReverseSortDirection(!reverseSortDirection);
								setSortBy("createdAt");
							}}
							width="15%"
						>
							Created At
						</Th>
						<th className={classes.th} style={{ width: "10%" }}>
							<UnstyledButton className={classes.control}>
								<Group position="apart">
									<Text weight={500} size="sm">
										Action
									</Text>
								</Group>
							</UnstyledButton>
						</th>
					</>
				)}
				tr_element={() => (
					<>
						{dataPage && dataPage.length > 0 && sortSearchData(sortBy, dataPage, dataAllPage).length > 0 ? (
							sortSearchData(sortBy, dataPage, dataAllPage).map((row) => (
								<tr key={row._id}>
									<td>
										<Link href={`${props.pathname?.split("?")[0]}/${row._id}`}>
											<a>
												<Text variant="link">{row.title}</Text>
											</a>
										</Link>
										<Tooltip label={"Edit order"}>
											<Link href={`${props.pathname?.split("?")[0]}/order`}>
												<a>
													<Text color="dimmed" mt={8}>
														{row.position}
													</Text>
												</a>
											</Link>
										</Tooltip>
									</td>
									<td>{row.description}</td>
									<td>
										{row.tags && row.tags.length > 0
											? row.tags.map((tags, i) => {
													return (
														<span key={i}>
															<Link href={`${props.pathname?.split("?")[0]}/tags?qAll=${tags}`}>
																<a>
																	<Text component="span" variant="link">
																		{tags}
																	</Text>
																</a>
															</Link>
															{i < row.tags!.length - 1 ? ", " : ""}
														</span>
													);
											  })
											: "Deleted/None"}
									</td>
									<td>
										{row.links && row.links.length > 0
											? row.links.map((links, i) => {
													const LinkIcon = iconMap[links.type];
													return (
														<Link href={links.url} passHref key={i}>
															<ActionIcon component="a">
																<LinkIcon />
															</ActionIcon>
														</Link>
													);
											  })
											: "Deleted/None"}
									</td>
									<td>
										{row.updatedAt !== row.createdAt ? (
											<Tooltip label={`Last edited at: ${formatDateWithTz(row.updatedAt, tz)}`}>
												<span>{formatDateWithTz(row.createdAt, tz)}</span>
											</Tooltip>
										) : (
											<>{formatDateWithTz(row.createdAt, tz)}</>
										)}
									</td>
									<td style={{ padding: "1rem .5rem" }}>
										<div className="dash-flex">
											<Link href={`${props.pathname?.split("?")[0]}/${row._id}`}>
												<a>
													<ActionIcon>
														<IconEdit size={14} stroke={1.5} />
													</ActionIcon>
												</a>
											</Link>
											<ActionIcon onClick={() => handleDelete(row._id)}>
												<IconTrash size={14} stroke={1.5} />
											</ActionIcon>
										</div>
									</td>
								</tr>
							))
						) : (
							<>
								<tr>
									<td colSpan={6}>
										<Text weight={500} align="center">
											Nothing found
										</Text>
									</td>
								</tr>
							</>
						)}
					</>
				)}
			/>
		</>
	);
};
