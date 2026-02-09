import {
    Card,
    CardActions,
    Typography,
    IconButton,
    Box,
    Divider,
    CardActionArea,
    Chip,
    Tooltip
} from "@mui/material";
import {
    CheckCircleOutline,
    Delete,
    ViewModule, // Changed icon
    Close,
    AccountTree,
    ViewList,
    Adjust
} from "@mui/icons-material";
import { Module } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
    module: Module;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (module: Module) => void;
}

export default function ModuleCard({ module, onToggle, onDelete, onClick }: ModuleCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projects } = useProjectStore();
    const project = projects.find(p => p.id === module.project_id);

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
                bgcolor: '#F5F5F5', // distinct background?
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
                {module.completed ? (
                    <CheckCircleOutline sx={{ fontSize: 200, color: '#C8E6C9' }} />
                ) : (
                    <ViewModule sx={{ fontSize: 200, color: module.color ? module.color : '#FFE0B2', opacity: 0.2 }} />
                )}
            </Box>

            <CardActionArea
                onClick={() => onClick && onClick(module)}
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
                    {module.title}
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
                    {module.description || t('modules.no_description', "No description")}
                </Typography>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', mb: 1, zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                        {project && (
                            <Chip
                                icon={<AccountTree sx={{ fontSize: 16 }} />}
                                label={project.title}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/modules?projectId=${project.id}`);
                                }}
                                sx={{
                                    mb: 1,
                                    zIndex: 1,
                                    bgcolor: project.color || 'action.selected',
                                    color: project.color ? '#fff' : 'text.primary',
                                    '& .MuiChip-icon': {
                                        color: 'inherit'
                                    },
                                    cursor: 'pointer'
                                }}
                            />
                        )}

                    </Box>
                </Box>
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
                                onToggle(module.id);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            {module.completed ? <Adjust /> : <CheckCircleOutline />}
                        </IconButton>

                        {/* View Features Button */}
                        <Tooltip title={t('modules.view_features', "View Features")}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/features?moduleId=${module.id}`);
                                }}
                                sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                            >
                                <ViewList />
                            </IconButton>
                        </Tooltip>

                        {/* Delete Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(true);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                            aria-label={t('common.delete')}
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
                            aria-label={t('common.cancel')}
                        >
                            <Close />
                        </IconButton>

                        {/* Confirm Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(module.id);
                            }}
                            color="error"
                            aria-label={t('common.confirm_delete')}
                        >
                            <Delete />
                        </IconButton>
                    </>
                )}
            </CardActions>
        </Card >
    );
}
