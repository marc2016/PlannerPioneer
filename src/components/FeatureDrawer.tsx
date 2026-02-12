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

    // PERT State
    const [pertOptimistic, setPertOptimistic] = useState<string>("");
    const [pertMostLikely, setPertMostLikely] = useState<string>("");
    const [pertPessimistic, setPertPessimistic] = useState<string>("");

    useEffect(() => {
        if (feature) {
            setTitle(feature.title);
            setDescription(feature.description || "");
            setColor(feature.color || COLORS[5]);
            setModuleId(feature.module_id || "");
            setPertOptimistic(feature.pert_optimistic?.toString() || "");
            setPertMostLikely(feature.pert_most_likely?.toString() || "");
            setPertPessimistic(feature.pert_pessimistic?.toString() || "");
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]);
            setModuleId("");
            setPertOptimistic("");
            setPertMostLikely("");
            setPertPessimistic("");
            setShowDeleteConfirm(false);
        }
    }, [feature, open]);

    const handleSave = async () => {
        if (!title.trim()) return;

        const pOptimistic = pertOptimistic ? parseFloat(pertOptimistic) : undefined;
        const pMostLikely = pertMostLikely ? parseFloat(pertMostLikely) : undefined;
        const pPessimistic = pertPessimistic ? parseFloat(pertPessimistic) : undefined;

        const featureData = {
            title,
            description,
            color,
            module_id: moduleId || undefined,
            pert_optimistic: pOptimistic,
            pert_most_likely: pMostLikely,
            pert_pessimistic: pPessimistic
        };

        if (feature) {
            await updateFeature(feature.id, featureData);
        } else {
            await addFeature(featureData);
        }
        onClose();
    };

    const handleDelete = async () => {
        if (feature) {
            await deleteFeature(feature.id);
            onClose();
        }
    };

    // Calculate Expected Duration for preview
    const calculateExpected = () => {
        const o = parseFloat(pertOptimistic);
        const m = parseFloat(pertMostLikely);
        const p = parseFloat(pertPessimistic);

        if (!isNaN(m)) {
            // If only M is provided, Expected = M. 
            // If O and P are provided, use PERT formula.
            // Handling optional O/P by falling back to M if missing, similar to the store logic?
            // The user said O/P are optional. 
            // Let's mirror the logic: If O/P are missing, they default to M in the formula, effectively making result M.
            const opt = !isNaN(o) ? o : m;
            const pes = !isNaN(p) ? p : m;
            const expected = (opt + 4 * m + pes) / 6;
            return parseFloat(expected.toFixed(1));
        }
        return null;
    };

    const expectedDuration = calculateExpected();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 600, p: 3 } }}
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

                {/* PERT Estimation Section */}
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {t('features.form.time_estimation', "Time Estimation (Hours)")}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                            label={t('features.form.optimistic', "Optimistic")}
                            type="number"
                            value={pertOptimistic}
                            onChange={(e) => setPertOptimistic(e.target.value)}
                            size="small"
                            fullWidth
                            helperText={t('features.form.optional', "Optional")}
                        />
                        <TextField
                            label={t('features.form.most_likely', "Most Likely")}
                            type="number"
                            value={pertMostLikely}
                            onChange={(e) => setPertMostLikely(e.target.value)}
                            size="small"
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('features.form.pessimistic', "Pessimistic")}
                            type="number"
                            value={pertPessimistic}
                            onChange={(e) => setPertPessimistic(e.target.value)}
                            size="small"
                            fullWidth
                            helperText={t('features.form.optional', "Optional")}
                        />
                    </Box>

                    {expectedDuration !== null && (
                        <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 1, fontWeight: 'bold' }}>
                            {t('features.form.expected_duration', "Expected Duration")}: {expectedDuration}h
                        </Typography>
                    )}
                </Box>

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
