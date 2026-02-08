import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    IconButton
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Project, useProjectStore } from "../store/useProjectStore";

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];

interface ProjectDrawerProps {
    open: boolean;
    onClose: () => void;
    project?: Project | null; // If null, creating new
}

export default function ProjectDrawer({ open, onClose, project }: ProjectDrawerProps) {
    const { addProject, updateProject, deleteProject } = useProjectStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[5]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description || "");
            setColor(project.color || COLORS[5]);
            setShowDeleteConfirm(false);
        } else {
            setTitle("");
            setDescription("");
            setColor(COLORS[5]); // Default blue
            setShowDeleteConfirm(false);
        }
    }, [project, open]);

    const handleSave = async () => {
        if (!title.trim()) return;

        if (project) {
            await updateProject(project.id, { title, description, color });
        } else {
            await addProject({ title, description, color });
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
            PaperProps={{ sx: { width: 400, p: 3 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {project ? "Edit Project" : "New Project"}
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Project Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Color</Typography>
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
                                Delete
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button color="inherit" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button color="error" variant="contained" onClick={handleDelete}>
                                    Confirm Delete
                                </Button>
                            </Box>
                        )
                    )}
                    {!showDeleteConfirm && (
                        <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
                            Save
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
