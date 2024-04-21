import { Container } from '@/models/portainerModels';
import { fetchContainers, getPortainerJwtTokenFromCookie } from '@/services/portainer';
import { Global } from '@emotion/react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import assert from 'assert';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

type FriendlyContainer = (Container & { friendlyName: string });

interface PageProps {
    imageTags: {
        [key: string]: FriendlyContainer[];
    };
}

interface Operation {
    state: "pending" | "workingOn" | "completed";
    message: string;
}

type ChangeTagState =
    | { type: "notStarted" }
    | { type: "finished" }
    | { type: "error" }
    | {
        type: "started";
        operations: Operation[];
    };


const EnvironmentRoute: React.FC<PageProps> = ({ imageTags }) => {
    const router = useRouter()
    const { environmentId } = router.query

    const [modalOpen, setModalOpen] = useState(false);

    const [targetTag, setTargetTag] = useState<string | undefined>(undefined);
    const [changeTagState, setChangeTagState] = useState<ChangeTagState>({ type: "notStarted" });

    function allContainers() {
        return Object.values(imageTags).flat();
    }

    function openChangeVersionModal(tag: string) {
        const allRunning = imageTags[tag].every(c => c.State === "running")
        const allExited = imageTags[tag].every(c => c.State === "exited")
        const allCreated = imageTags[tag].every(c => c.State === "created")
        assert(allRunning || allExited || allCreated, "All containers must be in the same state")

        if (allRunning) {
            return
        }

        setTargetTag(tag);
        setModalOpen(true);
    }

    function handleModalClose() {
        setModalOpen(false);
        setTargetTag(undefined);
        setChangeTagState({ type: "notStarted" });
    }

    function getRunningTag() {
        let foundTag: string | undefined = undefined;
        for (const [tag, containers] of Object.entries(imageTags)) {
            if (containers.every(c => c.State === "running")) {
                if (foundTag) {
                    throw new Error("Multiple running tags found");
                }
                foundTag = tag;
            }
        }

        return foundTag;
    }

    async function initiateTagChange() {
        const runningTag = getRunningTag();
        assert(targetTag, "Target tag must be set")
        const containers = allContainers();

        function containersWithTag(tag: string) {
            return containers.filter((c) => c.Image.endsWith(tag));
        }

        const containersToStart = containersWithTag(targetTag);
        const containersToStop = runningTag ? containersWithTag(runningTag) : [];

        const operations: Operation[] = []
        containersToStop.forEach((c) => {
            operations.push({
                message: `Stop ${c.Names[0]}`,
                state: "workingOn",
            });
        });
        containersToStart.forEach((c) => {
            operations.push({
                message: `Start ${c.Names[0]}`,
                state: "pending",
            });
        });

        setChangeTagState({
            type: "started",
            operations: operations,
        });

        if (containersToStop) {
            let response = await fetch(`/api/environment/${environmentId}/containers/stop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    containers: containersToStop.map((c) => c.Id),
                }),
            });

            if (!response.ok) {
                return setChangeTagState({
                    type: "error",
                });
            }

            for (const operation of operations) {
                if (operation.state === "workingOn") {
                    operation.state = "completed";
                }
            }
        }

        for (const operation of operations) {
            if (operation.state === "pending") {
                operation.state = "workingOn";
            }
        }

        setChangeTagState({
            type: "started",
            operations: operations,
        });

        const response = await fetch(`/api/environment/${environmentId}/containers/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                containers: containersWithTag(targetTag).map((c) => c.Id),
            }),
        });

        if (!response.ok) {
            return setChangeTagState({
                type: "error",
            });
        }

        for (const operation of operations) {
            if (operation.state === "workingOn") {
                operation.state = "completed";
            }
        }

        setChangeTagState({
            type: "started",
            operations: operations,
        });

        // TODO: This is a hack to force a reload of the page
        await new Promise((resolve) => setTimeout(resolve, 1000));
        window.location.reload();
    }

    return (
        <>
            <Global styles={"body {margin: 0;}"} />
            <Box sx={{ width: '100%' }}>
                <Typography variant="h4" gutterBottom>
                    Container List
                </Typography>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {Object.entries(imageTags).map(([tag, containers]) => (
                        <React.Fragment key={tag}>
                            <ListItemButton
                                sx={{
                                    display: "block",
                                    width: "100%"
                                }}
                                onClick={() => openChangeVersionModal(tag)}
                            >
                                <Typography variant="h5" gutterBottom>
                                    {tag}
                                </Typography>
                                <List>
                                    {containers.map((container) => (
                                        <ListItem key={container.Id}>
                                            <Chip
                                                label={container.State}
                                                sx={{
                                                    marginRight: "16px",
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    backgroundColor: {
                                                        running: "green",
                                                        exited: "red",
                                                        created: "blue"
                                                    }[container.State]
                                                }} />
                                            <ListItemText
                                                primary={container.friendlyName}
                                                secondary={(new Date(container.Created * 1000)).toUTCString()}
                                            />
                                            <Typography variant="caption" gutterBottom >{container.ImageID.slice(7, 14)}</Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </ListItemButton>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Box>
            <Dialog
                open={modalOpen}
                onClose={() => {
                    if (changeTagState.type !== "started") {
                        handleModalClose();
                    }
                }}
            >
                <DialogContent dividers sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <DialogTitle>Are you sure you want to switch from {getRunningTag()} to {targetTag}</DialogTitle>
                    {changeTagState.type === "started" && (
                        <List>
                            {changeTagState.operations.map((operation) => (
                                <ListItem key={operation.message}>
                                    <Chip
                                        label={operation.message}
                                        sx={{
                                            fontWeight: "bold",
                                            color: {
                                                completed: "white",
                                                pending: "black",
                                                workingOn: "black"
                                            }[operation.state],
                                            backgroundColor: {
                                                completed: "green",
                                                pending: undefined,
                                                workingOn: "orange"
                                            }[operation.state],
                                        }} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {changeTagState.type === "error" && (
                        <Typography color="error">Error changing tag</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModalClose} disabled={changeTagState.type === "started"}>
                        Cancel
                    </Button>
                    <Button autoFocus onClick={initiateTagChange} disabled={changeTagState.type === "started"}>Yes</Button>
                </DialogActions>
            </Dialog >
        </>
    )
};

export default EnvironmentRoute;

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const IMAGE_NAME_PREFIX = process.env.IMAGE_NAME_PREFIX!;

    const { environmentId } = context.query;
    const token = getPortainerJwtTokenFromCookie(context.req);

    const containers = await fetchContainers(token, environmentId as string);

    const imageTags: { [key: string]: FriendlyContainer[] } = {};
    containers.forEach(container => {
        const imageName = container.Image;

        if (!imageName.startsWith(IMAGE_NAME_PREFIX)) {
            return
        }

        const imageTag = imageName.split(':').pop()!;
        if (!imageTags[imageTag]) {
            imageTags[imageTag] = [];
        }

        const imageNameAfterPrefix = imageName.replace(IMAGE_NAME_PREFIX, '');
        const friendlyName = imageNameAfterPrefix.split(':').shift()!;
        imageTags[imageTag].push({
            ...container,
            friendlyName: friendlyName
        });
    });

    return {
        props: {
            imageTags: imageTags
        }
    };
}