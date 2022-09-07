import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, MultiSelect, Textarea } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { useStyles_BtnOutline, urlSafeRegex, SERVER_V1, handleSubmitForm, handleDeleteForm, handleResetForm } from "../../../helper";
import { IDCountQRes, IProject, linkIcon } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
import { ISelect } from "../../../interfaces/input/Select";
import isURL from "validator/lib/isURL";

interface IProjectFormProps extends IDashboardProps {
	project?: IProject;
}

interface projectForm {
	title: string;
	description: string;
	tags: string[];
	links: linkIcon[];
}

export const ProjectForm: NextPage<IProjectFormProps> = (props) => {
	const { classes } = useStyles_BtnOutline();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);
	// ------------------------------------------------------------
	const forms = useForm<projectForm>({
		initialValues: {
			title: "",
			description: "",
			tags: [],
			links: [],
		},

		validate: {
			title: (value) =>
				urlSafeRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, period, and @ regex",
			description: (value) => (value.length > 0 ? undefined : "Description is required"),
			tags: (value) => (value.length > 0 ? undefined : "Tags is required"),
			links: (value) => (value.length > 0 ? undefined : "Links is required"),
		},
	});
	const [tagsListData, setTagsListData] = useState<ISelect[]>([{ label: "Reload tags data", value: "reload", group: "Utility" }]);
	const [linksData, setLinksData] = useState<ISelect[]>([{ label: "Create one by typing `prefix:url`", value: "none", group: "Info" }]);

	// ------------------------------------------------------------
	const resetForm = () => {
		setSubmitted(false);

		if (!props.project) {
			forms.reset();
		} else {
			forms.setValues({
				title: props.project.title,
				description: props.project.description,
				tags: props.project.tags,
				links: props.project.links,
			});
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { title, description, tags, links } = forms.values;
		try {
			const req = await fetch(`${SERVER_V1}/${props.project ? "project/" + props.project._id : "project"}`, {
				method: props.project ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					tags,
					links,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				const { fromDashHome } = router.query;
				setTimeout(() => router.push(fromDashHome === "true" ? "../" : "../project"), 1500);
			} else {
				setUnsavedChanges(true);
				setLoading(false);
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			setUnsavedChanges(true);
			setLoading(false);
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

	const fetchTags = async () => {
		showNotification({ id: "tag-load", title: "Loading tags", message: "Please wait...", disallowClose: true, autoClose: false, loading: true });
		try {
			const req = await fetch(`${SERVER_V1}/project/tags`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const { message, data }: IDCountQRes = await req.json();

			if (req.status === 200) {
				setTagsListData((prev) => {
					const newFetch = data.map((tag) => ({ label: tag._id, value: tag._id, group: "Available" }));
					const newData = [...prev, ...newFetch];

					// remove dupe
					const unique = newData.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
					return unique;
				});

				updateNotification({ id: "tag-load", title: "Success", message, disallowClose: false, autoClose: 1500, loading: false });
			} else {
				updateNotification({ id: "tag-load", title: "Error", message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
			}
		} catch (error: any) {
			updateNotification({ id: "tag-load", title: "Error", message: error.message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		if (!pageOpenFetched) {
			fetchTags();
			if (props.project) {
				// edit mode
				forms.setValues({
					title: props.project.title,
					description: props.project.description,
					tags: props.project.tags,
					links: props.project.links,
				});
				setLinksData(
					props.project.links.map((link) => ({
						label: link.type + ":" + link.url,
						value: link.type + ":" + link.url,
						group: "Links",
					}))
				);
			} else {
				// create mode
				setUnsavedChanges(true);
				setEditable(true);
			}
		}
		setPageOpenFetched(true);
		// ------------------------------------------------------------
		// on page leave
		const warningText = "You might have unsaved changes - are you sure you wish to leave this page?";
		const handleWindowClose = (e: BeforeUnloadEvent) => {
			if (!unsavedChanges) return;
			e.preventDefault();
			return (e.returnValue = warningText);
		};
		const handleBrowseAway = () => {
			if (!unsavedChanges) return;
			if (window.confirm(warningText)) return;
			router.events.emit("routeChangeError");
			throw "routeChange aborted.";
		};

		window.addEventListener("beforeunload", handleWindowClose);
		router.events.on("routeChangeStart", handleBrowseAway);
		return () => {
			window.removeEventListener("beforeunload", handleWindowClose);
			router.events.off("routeChangeStart", handleBrowseAway);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unsavedChanges]);

	return (
		<>
			<TitleDashboard
				title={props.project ? "View/Edit Project" : "Add Project"}
				hrefLink={router.query.fromDashHome === "true" ? "../" : "../project"}
				hrefText={router.query.fromDashHome === "true" ? "Back to home" : "Back to projects"}
				HrefIcon={IconArrowLeft}
			/>

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Project title"
						{...forms.getInputProps("title")}
						description={`Project title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<Textarea
						mt="md"
						required
						label="Description"
						placeholder="Project description"
						{...forms.getInputProps("description")}
						description={`Project description.`}
						disabled={!editable}
					/>

					<MultiSelect
						mt="md"
						data={tagsListData}
						description=" "
						placeholder="Tags"
						value={forms.values.tags}
						onChange={(value) => {
							if (value?.includes("reload")) {
								fetchTags();
							} else {
								forms.setFieldValue("tags", value!);
							}
						}}
						label="Project Tags"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Create ${q}`}
						onCreate={(q) => {
							const item = { label: q.trim(), value: q.trim(), group: "New" };
							setTagsListData((prev) => [...prev, item]);
							forms.setFieldValue("tags", [...forms.values.tags, q]);

							return item;
						}}
						maxDropdownHeight={300}
						error={forms.errors.tags}
					/>

					<MultiSelect
						mt="md"
						data={linksData}
						description="Use the prefix: `github` `link` `download` `blog`"
						placeholder="Links"
						value={forms.values.links.map((link) => link.type + ":" + link.url)}
						onChange={(value) => {
							const valueGet = value
								?.filter((v) => v.includes(":"))
								.map((v) => {
									const link = {
										type: v.split(":")[0],
										url: v
											.replace(/github:/g, "")
											.replace(/link:/g, "")
											.replace(/download:/g, ""),
									};
									return link;
								});
							forms.setFieldValue("links", valueGet);
						}}
						label="Project Links"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Add ${q}`}
						// @ts-ignore
						onCreate={async (q) => {
							// must contain github: or link: or download: or blog:
							if (!q.includes("github:") && !q.includes("link:") && !q.includes("download:") && !q.includes("blog:")) {
								showNotification({ title: "Error", color: "red", message: "Links must contain prefix `github:` `link:` `download:` or `blog:`" });
								return q;
							}

							// remove github: link: download: blog: from the string
							const linkGet = q
								.replace(/github:/g, "")
								.replace(/link:/g, "")
								.replace(/download:/g, "")
								.replace(/blog:/g, "");

							if (!isURL(linkGet)) {
								showNotification({ title: "Error", color: "red", message: "Invalid URL provided" });
								return q;
							}

							const item = { label: q.trim(), value: q.trim(), group: "Links" };
							setLinksData((prev) => [...prev, item]);
							forms.setFieldValue("links", [...forms.values.links, { type: q.split(":")[0], url: linkGet }]);
							return item;
						}}
						maxDropdownHeight={300}
						error={forms.errors.links}
					/>

					<Group position="right" mt="md">
						{props.project ? (
							<>
								<Button
									color="red"
									onClick={() =>
										handleDeleteForm("project", {
											api_url: "project",
											redirect_url: router.query.fromDashHome === "true" ? "../" : "../project",
											id: props.project!._id,
											router: router,
											setLoading,
											setSubmitted,
											setUnsavedChanges,
										})
									}
								>
									Delete
								</Button>
								<Button
									color="yellow"
									variant="outline"
									className={classes.buttonCancel}
									onClick={() => {
										setUnsavedChanges(true);
										setEditable(!editable);
									}}
								>
									{editable ? "Disable edit" : "Enable Edit"}
								</Button>
								<Button color="pink" onClick={() => handleResetForm(resetForm)} disabled={!editable}>
									Reset changes
								</Button>
								<Button variant="outline" className={classes.buttonSubmit} type="submit" disabled={!editable}>
									Submit Edit
								</Button>
							</>
						) : (
							<>
								<Button color="pink" onClick={() => handleResetForm(resetForm)}>
									Reset
								</Button>
								<Button variant="outline" className={classes.buttonSubmit} type="submit">
									Submit
								</Button>
							</>
						)}
					</Group>
				</form>
			</Box>
		</>
	);
};
