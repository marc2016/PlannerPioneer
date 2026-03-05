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
    MenuItem,
    Slider
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { Module, useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore"; // Import Project Store
import { generateColorPalette } from "../lib/colorUtils";
import { useTranslation } from "react-i18next";
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    ListsToggle,
    diffSourcePlugin,
    DiffSourceToggleWrapper
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];

interface ModuleDrawerProps {
    open: boolean;
    onClose: () => void;
    module?: Module | null; // If null, creating new
    initialProjectId?: string;
}

export default function ModuleDrawer({ open, onClose, module, initialProjectId }: ModuleDrawerProps) {
    const { addModule, updateModule, deleteModule } = useModuleStore();
    const { projects } = useProjectStore(); // Get projects list
    const { t } = useTranslation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[5]);
    const [projectId, setProjectId] = useState<string>("");
    const [tShirtSize, setTShirtSize] = useState<'S' | 'M' | 'L' | 'XL' | ''>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (module) {
            setTitle(module.title);
            setDescription(module.description || "");
            setColor(module.color || COLORS[5]);
            setProjectId(module.project_id || "");
            setTShirtSize(module.tShirtSize || "");
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]);
            // Pre-fill project if filter is active and not 'all' or 'unassigned'
            // If 'unassigned', we also default to "" (None), effectively same as 'all' for now unless we want to enforce it?
            // Usually "None" is the default anyway.
            // But if a specific project is selected, we want that ID.
            if (initialProjectId && initialProjectId !== 'all' && initialProjectId !== 'unassigned') {
                setProjectId(initialProjectId);
                // Also could auto-set color from project?
                const proj = projects.find(p => p.id === initialProjectId);
                if (proj && proj.color) {
                    // Logic to set color palette or main color?
                    // The color picker uses generateColorPalette from project color.
                    // The color state is currently single color string.
                    // When user selects a project manually, we don't auto-set the *value* of color, 
                    // but we change the *options* available (the palette).
                    // The default color is COLORS[5]. 
                    // Maybe we should leave it as default or pick the project color?
                    // Let's stick to just setting the ID for now.
                }
            } else {
                setProjectId("");
            }
            setTShirtSize("");
            setShowDeleteConfirm(false);
        }
    }, [module, open, initialProjectId, projects]);

    const handleSave = async () => {
        if (!title.trim()) return;

        if (module) {
            await updateModule(module.id, { title, description, color, project_id: projectId || undefined, tShirtSize: (tShirtSize as 'S' | 'M' | 'L' | 'XL') || undefined });
        } else {
            await addModule({ title, description, color, project_id: projectId || undefined, tShirtSize: (tShirtSize as 'S' | 'M' | 'L' | 'XL') || undefined });
        }
        onClose();
    };

    const mdxPlugins = useMemo(() => [
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        diffSourcePlugin({ viewMode: 'rich-text' }),
        toolbarPlugin({
            toolbarContents: () => (
                <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <ListsToggle />
                </DiffSourceToggleWrapper>
            )
        })
    ], []);

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
            PaperProps={{ sx: { width: '50vw', minWidth: 400, p: 3, pt: 8 } }}
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

                <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1, p: 1, minHeight: 250, '& .mdxeditor': { minHeight: 250 }, '& .mdxeditor-toolbar': { zIndex: 10 }, '& [data-radix-popper-content-wrapper]': { zIndex: 1300 } }}>
                    <MDXEditor
                        markdown={description}
                        onChange={setDescription}
                        placeholder={t('modules.form.description', "Description")}
                        plugins={mdxPlugins}
                        contentEditableClassName="prose max-w-none"
                    />
                </Box>

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

                {/* T-Shirt Size Selection */}
                <Box sx={{ pt: 1, pb: 2, px: 2, border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('modules.form.t_shirt_size', "T-Shirt Size")}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color={tShirtSize ? 'primary' : 'text.secondary'}>
                            {[
                                t('modules.form.size_none', "None"),
                                t('modules.form.size_s', "S (Small)"),
                                t('modules.form.size_m', "M (Medium)"),
                                t('modules.form.size_l', "L (Large)"),
                                t('modules.form.size_xl', "XL (Extra Large)")
                            ][['', 'S', 'M', 'L', 'XL'].indexOf(tShirtSize) !== -1 ? ['', 'S', 'M', 'L', 'XL'].indexOf(tShirtSize) : 0]}
                        </Typography>
                    </Box>
                    <Box sx={{ px: 2 }}>
                        <Slider
                            value={['', 'S', 'M', 'L', 'XL'].indexOf(tShirtSize) !== -1 ? ['', 'S', 'M', 'L', 'XL'].indexOf(tShirtSize) : 0}
                            onChange={(_, newValue) => setTShirtSize(['', 'S', 'M', 'L', 'XL'][newValue as number] as any)}
                            step={1}
                            marks={[
                                { value: 0, label: '-' },
                                { value: 1, label: 'S' },
                                { value: 2, label: 'M' },
                                { value: 3, label: 'L' },
                                { value: 4, label: 'XL' },
                            ]}
                            min={0}
                            max={4}
                            valueLabelDisplay="off"
                        />
                    </Box>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('modules.form.color', "Color")}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(projectId ?
                            (() => {
                                const selectedProject = projects.find(p => p.id === projectId);
                                return selectedProject ? generateColorPalette(selectedProject.color || COLORS[5], 5) : COLORS;
                            })()
                            : COLORS
                        ).map((c) => (
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
