import {
    Card,
    CardActions,
    Typography,
    IconButton,
    Box,
    Divider,
    CardActionArea
} from "@mui/material";
import {
    CheckCircleOutline,
    Delete,
    Folder,
    Close
} from "@mui/icons-material";
import { Project } from "../store/useProjectStore";
import { useState } from "react";


interface ProjectCardProps {
    project: Project;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (project: Project) => void;
}

export default function ProjectCard({ project, onToggle, onDelete, onClick }: ProjectCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper to format date if needed, or just display raw for now?
    // Let's not complicate it yet.

    return (
        <Card
            variant="outlined"
            sx={{
                width: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#F5F5F5',
                transition: '0.3s',
                '&:hover': {
                    boxShadow: 6,
                    cursor: 'pointer'
                }
            }}
        >
            {/* Background Icon */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '85%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            >
                {project.completed ? (
                    <CheckCircleOutline sx={{ fontSize: 200, color: '#C8E6C9' }} />
                ) : (
                    // Use project color/opacity for the folder icon
                    <Folder sx={{ fontSize: 200, color: project.color ? project.color : '#FFE0B2', opacity: 0.2 }} />
                )}
            </Box>

            <CardActionArea
                onClick={() => onClick && onClick(project)}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    p: 2,
                    zIndex: 1,
                    height: '100%'
                }}
            >
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        width: '100%',
                        fontWeight: 500,
                        lineHeight: 1.2,
                        mb: 1,
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        zIndex: 1
                    }}
                >
                    {project.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        width: '100%',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        flexGrow: 1,
                        zIndex: 1
                    }}
                >
                    {project.description || "No description"}
                </Typography>

            </CardActionArea>

            <Divider />

            <CardActions sx={{ bgcolor: 'white', justifyContent: 'flex-end', zIndex: 2, p: 1 }} onClick={(e) => e.stopPropagation()}>
                {!isDeleting ? (
                    <>
                        {/* Toggle Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(project.id);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            {project.completed ? <Folder /> : <CheckCircleOutline />}
                        </IconButton>

                        {/* Delete Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(true);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            <Delete />
                        </IconButton>
                    </>
                ) : (
                    <>
                        {/* Cancel Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(false);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            <Close />
                        </IconButton>

                        {/* Confirm Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(project.id);
                            }}
                            color="error"
                        >
                            <Delete />
                        </IconButton>
                    </>
                )}
            </CardActions>
        </Card>
    );
}
