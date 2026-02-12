import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment
} from "@mui/material";
import { Close, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Project, ProjectFactor, useProjectStore } from "../store/useProjectStore";
import { useTranslation } from "react-i18next";

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];

interface ProjectDrawerProps {
    open: boolean;
    onClose: () => void;
    project?: Project | null; // If null, creating new
}

export default function ProjectDrawer({ open, onClose, project }: ProjectDrawerProps) {
    const { addProject, updateProject, deleteProject, addFactor, removeFactor } = useProjectStore();
    const { t } = useTranslation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[5]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Local state for factors
    // We need to track existing factors (to keep or remove) and new factors (to add)
    // Simplified: localFactors list. 
    // If it has an ID that exists in project.factors, it's existing.
    // If we remove it from list, we track it for deletion.
    const [localFactors, setLocalFactors] = useState<ProjectFactor[]>([]);
    const [deletedFactorIds, setDeletedFactorIds] = useState<string[]>([]);

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description || "");
            setColor(project.color || COLORS[5]);
            setLocalFactors(project.factors || []);
            setDeletedFactorIds([]);
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]); // Default blue
            setLocalFactors([]);
            setDeletedFactorIds([]);
            setShowDeleteConfirm(false);
        }
    }, [project, open]);

    const handleAddFactor = () => {
        const newFactor: ProjectFactor = {
            id: crypto.randomUUID(), // Temp ID
            projectId: project?.id || '', // Will be set on save if new
            label: '',
            value: 0
        };
        setLocalFactors([...localFactors, newFactor]);
    };

    const handleRemoveFactor = (id: string, isExisting: boolean) => {
        setLocalFactors(localFactors.filter(f => f.id !== id));
        if (isExisting) {
            setDeletedFactorIds([...deletedFactorIds, id]);
        }
    };

    const handleFactorChange = (id: string, field: 'label' | 'value', value: string | number) => {
        setLocalFactors(localFactors.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        const projectId = project?.id || crypto.randomUUID();

        if (project) {
            await updateProject(project.id, { title, description, color });
        } else {
            await addProject({ id: projectId, title, description, color });
        }

        // Handle Factors
        // 1. Delete removed factors
        for (const id of deletedFactorIds) {
            await removeFactor(id);
        }

        const originalFactorIds = new Set(project?.factors?.map(f => f.id) || []);

        for (const factor of localFactors) {
            if (!originalFactorIds.has(factor.id)) {
                await addFactor(projectId, factor.label, Number(factor.value));
            } else {
                const original = project?.factors?.find(f => f.id === factor.id);
                if (original && (original.label !== factor.label || original.value !== factor.value)) {
                    await removeFactor(factor.id);
                    await addFactor(projectId, factor.label, Number(factor.value));
                }
            }
        }

        onClose();
    };

    const handleDelete = async () => {
        if (project) {
            await deleteProject(project.id);
            onClose();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 600, p: 3 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {project ? t('projects.edit_project') : t('projects.new_project')}
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label={t('projects.form.title')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label={t('projects.form.description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                {/* Factors Section */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{t('projects.factors.title', 'Factors')}</Typography>
                        <Button size="small" onClick={handleAddFactor}>
                            {t('projects.factors.add_factor', 'Add')}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {localFactors.map((factor) => (
                            <Box key={factor.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                    value={factor.label}
                                    onChange={(e) => handleFactorChange(factor.id, 'label', e.target.value)}
                                    placeholder={t('projects.factors.label', 'Label')}
                                    size="small"
                                    fullWidth
                                />
                                <TextField
                                    value={factor.value}
                                    onChange={(e) => handleFactorChange(factor.id, 'value', e.target.value)}
                                    placeholder="%"
                                    type="number"
                                    size="small"
                                    sx={{ width: 130 }}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveFactor(factor.id, !!project?.factors?.find(f => f.id === factor.id))}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        {localFactors.length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                                No factors added.
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('projects.form.color')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <TextField
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            label={t('projects.form.hex_code', "Hex Code")}
                            size="small"
                            sx={{ width: 120 }}
                        />
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{
                                width: 40,
                                height: 40,
                                padding: 0,
                                border: 'none',
                                cursor: 'pointer',
                                background: 'transparent'
                            }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        {t('projects.form.presets', "Presets")}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {COLORS.map((c) => (
                            <Box
                                key={c}
                                onClick={() => setColor(c)}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: c,
                                    cursor: 'pointer',
                                    border: color === c ? '2px solid black' : '1px solid transparent',
                                    transition: 'transform 0.1s',
                                    '&:hover': { transform: 'scale(1.1)' }
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    {project && (
                        !showDeleteConfirm ? (
                            <Button color="error" onClick={() => setShowDeleteConfirm(true)}>
                                {t('common.delete')}
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button color="inherit" onClick={() => setShowDeleteConfirm(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button color="error" variant="contained" onClick={handleDelete}>
                                    {t('common.confirm_delete')}
                                </Button>
                            </Box>
                        )
                    )}
                    {!showDeleteConfirm && (
                        <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
                            {t('common.save')}
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
