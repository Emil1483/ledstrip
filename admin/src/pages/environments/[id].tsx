import { Container } from '@/models/portainerModels';
import { fetchContainers, getPortainerJwtTokenFromCookie } from '@/services/portainer';
import { Box, Chip, List, ListItem, ListItemText, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

type FriendlyContainer = (Container & { friendlyName: string });

interface PageProps {
    imageTags: {
        [key: string]: FriendlyContainer[];
    };
}

const EnvironmentRoute: React.FC<PageProps> = ({ imageTags }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Container List
            </Typography>
            {Object.entries(imageTags).map(([tag, containers]) => (
                <div key={tag}>
                    <Typography variant="h5" gutterBottom>
                        {tag}
                    </Typography>
                    <List>
                        {containers.map((container, index) => (
                            <ListItem key={index}>
                                <Chip
                                    label={container.State}
                                    sx={{
                                        marginRight: "16px",
                                        color: "white",
                                        fontWeight: "bold",
                                        backgroundColor: {
                                            running: "green",
                                            exited: "red"
                                        }[container.State]
                                    }} />
                                <ListItemText primary={container.friendlyName} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            ))}
        </Box>
    )
};

export default EnvironmentRoute;

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const IMAGE_NAME_PREFIX = process.env.IMAGE_NAME_PREFIX!;

    const { id } = context.query;
    const token = getPortainerJwtTokenFromCookie(context);

    const containers = await fetchContainers(token, id as string);

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