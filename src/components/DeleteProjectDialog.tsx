import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    FormControlLabel,
    Checkbox,
    Box
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Project } from "../store/useProjectStore";

interface DeleteProjectDialogProps {
    open: boolean;
    project: Project | null;
    onClose: () => void;
    onConfirm: (projectId: string, deleteChildren: boolean) => void;
}

export default function DeleteProjectDialog({ open, project, onClose, onConfirm }: DeleteProjectDialogProps) {
    const { t } = useTranslation();
    const [deleteChildren, setDeleteChildren] = useState(false);

    if (!project) return null;

    const handleConfirm = () => {
        onConfirm(project.id, deleteChildren);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} onClick={(e) => e.stopPropagation()}>
            <DialogTitle>
                {t('projects.delete_project_title', 'Projekt löschen')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('projects.delete_project_confirm', 'Möchtest du das Projekt "{{title}}" wirklich löschen?', { title: project.title })}
                </DialogContentText>
                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={deleteChildren}
                                onChange={(e) => setDeleteChildren(e.target.checked)}
                                color="error"
                            />
                        }
                        label={t('projects.delete_children_label', 'Alle zugehörigen Module und Features löschen')}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel', 'Abbrechen')}
                </Button>
                <Button onClick={handleConfirm} color="error" variant="contained">
                    {t('common.delete', 'Löschen')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
