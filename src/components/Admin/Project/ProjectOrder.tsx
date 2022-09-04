import Link from "next/link";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ActionIcon, createStyles, LoadingOverlay, Text } from "@mantine/core";
import { useId, useListState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IconGripVertical, IconEdit, IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1 } from "../../../helper/global/constants";
import { TitleDashboard } from "../../Utils/Dashboard";
import { IProject } from "../../../interfaces/db";

const useStyles = createStyles((theme) => ({
	item: {
		display: "flex",
		alignItems: "center",
		borderRadius: theme.radius.md,
		border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
		padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
		paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
		backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
		marginBottom: theme.spacing.sm,
	},

	relativeDiv: {
		position: "relative",
	},

	editIcon: {
		position: "absolute",
		right: "10px",
	},

	iconHover: {
		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[0],
		},
	},

	itemDragging: {
		boxShadow: theme.shadows.sm,
	},

	dragHandle: {
		...theme.fn.focusStyles(),
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
		color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
	},
}));

export const ProjectOrder: NextPage<IDashboardProps> = (props) => {
	const { classes, cx } = useStyles();
	const [state, setState_List] = useListState<IProject>();
	const [localState, setLocalState] = useState<IProject[]>([]);
	const [loading, setLoading] = useState(true);
	const randId = useId();

	const fillData = async () => {
		try {
			const fetchData = await fetch(SERVER_V1 + "/project?byPosition=true", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (fetchData.status !== 200) return setState_List.setState([]);

			const { data }: { data: IProject[] } = await fetchData.json();
			setState_List.setState(data);
			setLocalState(data);
			setLoading(false);
		} catch (error) {
			setState_List.setState([]);
			setLoading(false);
		}
	};

	const updatePosToDB = async (pos: number, _id: string) => {
		try {
			const fetchData = await fetch(SERVER_V1 + `/project/${_id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					position: pos,
				}),
			});

			if (fetchData.status !== 200) return;
		} catch (error) {
			showNotification({
				title: "Error",
				message: `Could not update project position to DB\nReason${error}`,
				color: "red",
			});
		}
	};

	useEffect(() => {
		fillData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={classes.relativeDiv}>
			<TitleDashboard title={"Projects Order"} hrefLink={"../project"} hrefText="Back to Project" HrefIcon={IconArrowLeft} />

			{state.length > 0 ? (
				<>
					<DragDropContext
						onDragEnd={({ destination, source }) => {
							setState_List.reorder({ from: source.index, to: destination?.index || 0 });

							// only update db if data is not empty
							if (localState.length > 0)
								setLocalState((prev) => {
									const newState = [...prev];
									newState.splice(source.index, 1);
									newState.splice(destination?.index || 0, 0, prev[source.index]);
									newState.forEach((note, index) => {
										newState[index].position = index;
										updatePosToDB(index, note._id);
									});

									return newState;
								});
						}}
					>
						<Droppable droppableId="dnd-list" direction="vertical">
							{(provided) => (
								<div {...provided.droppableProps} ref={provided.innerRef}>
									{state.map((item, index) => (
										<Draggable index={index} draggableId={item._id} key={item._id}>
											{(provided, snapshot) => (
												<>
													<div className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })} ref={provided.innerRef} {...provided.draggableProps}>
														<div {...provided.dragHandleProps} className={classes.dragHandle}>
															<IconGripVertical size={18} stroke={1.5} />
														</div>
														<div className="md-wrapper">
															<Text>{item.title}</Text>
															<Text component="div" color="dimmed">
																{item.description}
															</Text>
														</div>

														<div className={classes.editIcon}>
															<Link href={`../project/${item._id}`}>
																<ActionIcon>
																	<IconEdit />
																</ActionIcon>
															</Link>
														</div>
													</div>
												</>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</>
			) : (
				<>
					<LoadingOverlay overlayBlur={4} visible={loading} zIndex={1} />
					<div className={cx(classes.item, { [classes.itemDragging]: false })}>
						<div className={classes.dragHandle}>
							<IconGripVertical size={18} stroke={1.5} />
						</div>
						<div>
							<Text>Project is empty</Text>
							<Text color="dimmed" size="sm">
								Add projects to get started
							</Text>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
