import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useMemo, useEffect } from "react";
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

interface DescriptionModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    initialDescription: string;
    onSave: (description: string) => void;
}

export default function DescriptionModal({ open, onClose, title, initialDescription, onSave }: DescriptionModalProps) {
    const { t } = useTranslation();
    const [description, setDescription] = useState(initialDescription || "");

    useEffect(() => {
        if (open) {
            setDescription(initialDescription || "");
        }
    }, [open, initialDescription]);

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

    const handleSave = () => {
        onSave(description);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: '60vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1, p: 1, height: '100%', minHeight: 400, '& .mdxeditor': { minHeight: 400 }, '& .mdxeditor-toolbar': { zIndex: 10 }, '& [data-radix-popper-content-wrapper]': { zIndex: 1300 } }}>
                    <MDXEditor
                        markdown={description}
                        onChange={setDescription}
                        placeholder={t('projects.form.description', "Description")}
                        plugins={mdxPlugins}
                        contentEditableClassName="prose max-w-none"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('common.save', 'Save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
