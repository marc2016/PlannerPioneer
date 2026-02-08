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
import { Feature, useFeatureStore } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore"; // Import Module Store
import { useTranslation } from "react-i18next";

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];

interface FeatureDrawerProps {
    open: boolean;
    onClose: () => void;
    feature?: Feature | null; // If null, creating new
}

export default function FeatureDrawer({ open, onClose, feature }: FeatureDrawerProps) {
    const { addFeature, updateFeature, deleteFeature } = useFeatureStore();
    const { modules } = useModuleStore(); // Get modules list
    const { t } = useTranslation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[5]);
    const [moduleId, setModuleId] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (feature) {
            setTitle(feature.title);
            setDescription(feature.description || "");
            setColor(feature.color || COLORS[5]);
            setModuleId(feature.module_id || "");
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]);
            setModuleId("");
            setShowDeleteConfirm(false);
        }
    }, [feature, open]);

    const handleSave = async () => {
        if (!title.trim()) return;

        if (feature) {
            await updateFeature(feature.id, { title, description, color, module_id: moduleId || undefined });
        } else {
            await addFeature({ title, description, color, module_id: moduleId || undefined });
        }
        onClose();
    };

    const handleDelete = async () => {
        if (feature) {
            await deleteFeature(feature.id);
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
                    {feature ? t('features.edit_feature', "Edit Feature") : t('features.new_feature', "New Feature")}
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label={t('features.form.title', "Feature Title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label={t('features.form.description', "Description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                {/* Module Selection */}
                <FormControl fullWidth>
                    <InputLabel id="module-select-label">{t('features.form.module', "Module")}</InputLabel>
                    <Select
                        labelId="module-select-label"
                        value={moduleId}
                        label={t('features.form.module', "Module")}
                        onChange={(e) => setModuleId(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>{t('common.none', "None")}</em>
                        </MenuItem>
                        {modules.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                                {m.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('features.form.color', "Color")}</Typography>
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
                    {feature && (
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
