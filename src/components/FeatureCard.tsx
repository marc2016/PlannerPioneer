import {
    Card,
    CardActions,
    Typography,
    IconButton,
    Box,
    Divider,
    CardActionArea,
    Chip
} from "@mui/material";
import {
    CheckCircleOutline,
    Delete,
    Calculate, // Changed icon for Feature (Calculation Item)
    Close,
    AccountTree,
    ViewModule,
    Adjust
} from "@mui/icons-material";
import { Feature } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface FeatureCardProps {
    feature: Feature;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (feature: Feature) => void;
}

export default function FeatureCard({ feature, onToggle, onDelete, onClick }: FeatureCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { modules } = useModuleStore();
    const { projects } = useProjectStore();

    const module = feature.module_id ? modules.find(m => m.id === feature.module_id) : undefined;
    const project = module?.project_id ? projects.find(p => p.id === module.project_id) : undefined;

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
                {feature.completed ? (
                    <CheckCircleOutline sx={{ fontSize: 200, color: '#C8E6C9' }} />
                ) : (
                    <Calculate sx={{ fontSize: 200, color: feature.color ? feature.color : '#FFE0B2', opacity: 0.2 }} />
                )}
            </Box>

            <CardActionArea
                onClick={() => onClick && onClick(feature)}
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
                    {feature.title}
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
                        zIndex: 1,
                        mb: 1
                    }}
                >
                    {feature.description || t('features.no_description', "No description")}
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 1, zIndex: 1 }}>
                    {/* Duration Display */}
                    {feature.expected_duration !== undefined && (
                        <Chip
                            label={`${feature.expected_duration}h`}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                        />
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', flexGrow: 1 }}>
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
                                    bgcolor: project.color || 'action.selected',
                                    color: project.color ? '#fff' : 'text.primary',
                                    '& .MuiChip-icon': {
                                        color: 'inherit'
                                    },
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                        {module && (
                            <Chip
                                icon={<ViewModule sx={{ fontSize: 16 }} />}
                                label={module.title}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/features?moduleId=${module.id}`);
                                }}
                                sx={{
                                    bgcolor: module.color || 'action.selected',
                                    color: module.color ? '#fff' : 'text.primary',
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
                                onToggle(feature.id);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            {feature.completed ? <Adjust /> : <CheckCircleOutline />}
                        </IconButton>

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
                                onDelete(feature.id);
                            }}
                            color="error"
                            aria-label={t('common.confirm_delete')}
                        >
                            <Delete />
                        </IconButton>
                    </>
                )}
            </CardActions>
        </Card>
    );
}
