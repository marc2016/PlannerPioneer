import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Module, useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore"; // Import Project Store
import { useTranslation } from "react-i18next";

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];

interface ModuleDrawerProps {
    open: boolean;
    onClose: () => void;
    module?: Module | null; // If null, creating new
}

export default function ModuleDrawer({ open, onClose, module }: ModuleDrawerProps) {
    const { addModule, updateModule, deleteModule } = useModuleStore();
    const { projects } = useProjectStore(); // Get projects list
    const { t } = useTranslation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[5]);
    const [projectId, setProjectId] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (module) {
            setTitle(module.title);
            setDescription(module.description || "");
            setColor(module.color || COLORS[5]);
            setProjectId(module.project_id || "");
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]);
            setProjectId("");
            setShowDeleteConfirm(false);
        }
    }, [module, open]);

    const handleSave = async () => {
        if (!title.trim()) return;

        if (module) {
            await updateModule(module.id, { title, description, color, project_id: projectId || undefined });
        } else {
            await addModule({ title, description, color, project_id: projectId || undefined });
        }
        onClose();
    };

    const handleDelete = async () => {
        if (module) {
            await deleteModule(module.id);
            onClose();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 400, p: 3 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {module ? t('modules.edit_module', "Edit Module") : t('modules.new_module', "New Module")}
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label={t('modules.form.title', "Module Title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label={t('modules.form.description', "Description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                {/* Project Selection */}
                <FormControl fullWidth>
                    <InputLabel id="project-select-label">{t('modules.form.project', "Project")}</InputLabel>
                    <Select
                        labelId="project-select-label"
                        value={projectId}
                        label={t('modules.form.project', "Project")}
                        onChange={(e) => setProjectId(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>{t('common.none', "None")}</em>
                        </MenuItem>
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('modules.form.color', "Color")}</Typography>
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
                    {module && (
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
