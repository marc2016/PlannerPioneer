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
    Adjust,
    AccessTime,
    Description,
    Checkroom,
    TaskAlt
} from "@mui/icons-material";
import { Module, useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import { useFeatureStore } from "../store/useFeatureStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DescriptionModal from "./DescriptionModal";

interface ModuleCardProps {
    module: Module;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (module: Module) => void;
}

export default function ModuleCard({ module, onToggle, onDelete, onClick }: ModuleCardProps) {
    const { updateModule } = useModuleStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projects } = useProjectStore();
    const { features } = useFeatureStore();
    const project = projects.find(p => p.id === module.project_id);

    const moduleFeatures = features.filter(f => f.module_id === module.id);
    const featureCount = moduleFeatures.length;
    const totalDuration = moduleFeatures.reduce((sum, f) => sum + (f.expected_duration || 0), 0);

    return (
        <Card
            variant="outlined"
            sx={{
                width: '100%',
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#F5F5F5', // distinct background?
                transition: '0.3s',
                borderLeft: `6px solid ${module.color || '#FFE0B2'}`,
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

                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', mb: 1, zIndex: 1, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
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
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        {module.tShirtSize && (
                            <Chip
                                icon={<Checkroom fontSize="small" />}
                                label={module.tShirtSize}
                                size="small"
                                color={
                                    module.tShirtSize === 'S' ? 'success' :
                                        module.tShirtSize === 'M' ? 'info' :
                                            module.tShirtSize === 'L' ? 'warning' :
                                                module.tShirtSize === 'XL' ? 'error' : 'default'
                                }
                                sx={{ opacity: 0.9, fontWeight: 'bold' }}
                            />
                        )}
                        <Chip
                            icon={<ViewList fontSize="small" />}
                            label={`${featureCount} ${t('modules.form.feature_count', "Items")}`}
                            size="small"
                            variant="outlined"
                            sx={{ opacity: 0.8 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {totalDuration > 0 && (
                            <Tooltip title={t('common.expected_duration', 'Erwartete Dauer')}>
                                <Chip
                                    icon={<AccessTime fontSize="small" />}
                                    label={`~ ${totalDuration.toFixed(1)}h`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ opacity: 0.8 }}
                                />
                            </Tooltip>
                        )}
                        {module.actualDuration !== undefined && module.actualDuration > 0 && (
                            <Tooltip title={t('common.actual_duration', 'Tatsächliche Dauer')}>
                                <Chip
                                    icon={<TaskAlt fontSize="small" />}
                                    label={`${module.actualDuration}h`}
                                    size="small"
                                    variant={module.actualDuration > totalDuration ? "filled" : "outlined"}
                                    color={module.actualDuration > totalDuration ? "error" : "success"}
                                    sx={{ opacity: 0.8 }}
                                />
                            </Tooltip>
                        )}
                    </Box>



                </Box>
            </CardActionArea>

            <Divider />

            <CardActions sx={{ bgcolor: 'white', justifyContent: 'flex-end', zIndex: 2, p: 1 }} onClick={(e) => e.stopPropagation()}>
                {!isDeleting ? (
                    <>
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

                        {/* Edit Description Button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDescriptionModalOpen(true);
                            }}
                            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                            title={t('common.edit_description', 'Beschreibung bearbeiten')}
                        >
                            <Description />
                        </IconButton>

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

            <DescriptionModal
                open={isDescriptionModalOpen}
                onClose={() => setIsDescriptionModalOpen(false)}
                title={module.title}
                initialDescription={module.description || ""}
                onSave={(desc) => updateModule(module.id, { description: desc })}
            />
        </Card >
    );
}
