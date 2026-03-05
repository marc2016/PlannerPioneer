import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, Button, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore';
import { useModuleStore } from '../store/useModuleStore';
import { useFeatureStore } from '../store/useFeatureStore';
import { useSettingsStore } from '../store/useSettingsStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import { IconButton, Tooltip } from '@mui/material';
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    tablePlugin,
    diffSourcePlugin,
    toolbarPlugin,
    DiffSourceToggleWrapper,
    codeBlockPlugin,
    CodeBlockEditorDescriptor
} from '@mdxeditor/editor';
import mermaid from 'mermaid';
import '@mdxeditor/editor/style.css';

export default function ProjectReport() {
    const { t } = useTranslation();
    const { projects } = useProjectStore();
    const { modules } = useModuleStore();
    const { features } = useFeatureStore();
    const { selectedProjectId } = useSettingsStore();

    const [markdownText, setMarkdownText] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const project = useMemo(() => {
        return projects.find((p) => p.id === selectedProjectId) || null;
    }, [projects, selectedProjectId]);

    useEffect(() => {
        if (!project) {
            setMarkdownText(t('report.no_project'));
            return;
        }

        const projectModules = modules.filter(m => m.project_id === project.id);
        const moduleIds = projectModules.map(m => m.id);
        const projectFeatures = features.filter(f => f.module_id && moduleIds.includes(f.module_id));

        const totalVariance = projectFeatures.reduce((acc, f) => acc + (f.variance || 0), 0);
        const stdDev = Math.sqrt(totalVariance);

        let md = `# ${project.title}\n\n`;
        if (project.description) {
            md += `${project.description}\n\n`;
        }

        md += `**${t('common.status')}:** ${project.completed ? t('common.completed') : t('common.not_completed')}\n`;
        if (project.startDate) md += `**${t('projects.form.start_date')}:** ${new Date(project.startDate).toLocaleDateString()}\n`;
        if (project.endDate) md += `**${t('projects.form.end_date')}:** ${new Date(project.endDate).toLocaleDateString()}\n`;
        md += `**${t('projects.total_duration')}:** ${project.totalDuration || 0}\n\n`;

        // 1. Mermaid Pie Chart for Modules
        if (projectModules.length > 0) {
            md += `## ${t('structure.composition_treemap')}\n\n`;

            md += "```mermaid\n";
            // Inject module colors via Mermaid init header INSIDE the block
            const pieColors = projectModules.map((m, i) => `"pie${i + 1}": "${m.color}"`).join(', ');
            md += `%%{init: { "theme": "default", "themeVariables": { ${pieColors} } } }%%\n`;
            md += `pie title ${t('structure.module_distribution')}\n`;
            projectModules.forEach(m => {
                const modFeatures = projectFeatures.filter(f => f.module_id === m.id);
                const duration = modFeatures.reduce((acc, f) => acc + (f.expected_duration || 0), 0);
                md += `    "${m.title.replace(/"/g, "'")}" : ${duration > 0 ? duration.toFixed(1) : 1}\n`;
            });
            md += "```\n\n";
        }

        // 2. Mermaid Mindmap for Structure
        if (projectModules.length > 0) {
            md += `## ${t('navigation.structure')}\n\n`;

            md += "```mermaid\n";
            // Inject branch colors for Mindmap via init header
            const branchColors = projectModules.map((m, i) => `"mindmapBranchColor${i}": "${m.color}"`).join(', ');
            md += `%%{init: { "theme": "default", "themeVariables": { ${branchColors} } } }%%\n`;
            md += "mindmap\n";
            md += `  root(("${project.title.replace(/[()\[\]"]/g, "")}"))\n`;

            projectModules.forEach((m) => {
                md += `    (("${m.title.replace(/[()\[\]"]/g, "")}"))\n`;
                const modFeatures = projectFeatures.filter(f => f.module_id === m.id);
                modFeatures.forEach(f => {
                    md += `      ("${f.title.replace(/[()\[\]"]/g, "")}")\n`;
                });
            });
            md += "```\n\n";
        }

        // 3. Sigma Probability Distribution (Normal Curve)
        const baseDuration = project.totalDuration || 0;
        const factors = project.factors || [];
        const factorDuration = factors.reduce((acc, f) => acc + (baseDuration * (f.value / 100)), 0);
        const expectedD = baseDuration + factorDuration;

        md += `## ${t('table.sigma_tooltip_title')}\n\n`;
        md += "```mermaid\n";
        md += "xychart-beta\n";
        md += `    title "${t('table.sigma_tooltip_title')}"\n`;
        md += `    x-axis ["${(expectedD - 3 * stdDev).toFixed(0)}", "${(expectedD - 2 * stdDev).toFixed(0)}", "${(expectedD - stdDev).toFixed(0)}", "${expectedD.toFixed(0)}", "${(expectedD + stdDev).toFixed(0)}", "${(expectedD + 2 * stdDev).toFixed(0)}", "${(expectedD + 3 * stdDev).toFixed(0)}"]\n`;
        md += `    y-axis 0 --> 1\n`;

        // Simulating a bell curve with 7 points
        const curvePoints = "0.01, 0.15, 0.6, 1, 0.6, 0.15, 0.01";
        md += `    line [${curvePoints}]\n`;
        md += "```\n\n";

        // 4. Deviation Risk Bar Chart (using xy-chart)
        md += `## ${t('structure.deviation_risk')}\n\n`;
        md += "```mermaid\n";
        md += "xychart-beta\n";
        md += `    title "${t('structure.deviation_risk')}"\n`;
        md += `    x-axis ["Expected", "1σ (68%)", "2σ (95%)", "3σ (99%)"]\n`;
        md += `    y-axis "Hours" 0 --> ${Math.ceil(expectedD + 3 * stdDev) + 10}\n`;
        md += `    bar [${expectedD.toFixed(1)}, ${(expectedD + stdDev).toFixed(1)}, ${(expectedD + 2 * stdDev).toFixed(1)}, ${(expectedD + 3 * stdDev).toFixed(1)}]\n`;
        md += "```\n\n";

        md += `## ${t('modules.title')}\n\n`;
        projectModules.forEach((mod, index) => {
            md += `### ${index + 1}. ${mod.title}\n\n`;
            if (mod.description) md += `${mod.description}\n\n`;
            md += `- **${t('common.status')}**: ${mod.completed ? t('common.completed') : t('common.not_completed')}\n`;
            if (mod.tShirtSize) md += `- **${t('modules.form.t_shirt_size')}**: ${mod.tShirtSize}\n`;
            md += '\n';

            const modFeatures = projectFeatures.filter(f => f.module_id === mod.id);
            if (modFeatures.length > 0) {
                md += `#### ${t('features.title')} (${mod.title})\n\n`;
                md += `| ${t('table.columns.feature')} | ${t('table.columns.expected')} | ${t('table.columns.optimistic')} | ${t('table.columns.most_likely')} | ${t('table.columns.pessimistic')} | ${t('table.columns.status')} |\n`;
                md += `|---|---|---|---|---|---|\n`;
                modFeatures.forEach(f => {
                    const statusStr = f.completed ? t('common.completed') : t('common.not_completed');
                    md += `| ${f.title} | ${f.expected_duration?.toFixed(1) || '-'} | ${f.pert_optimistic || '-'} | ${f.pert_most_likely || '-'} | ${f.pert_pessimistic || '-'} | ${statusStr} |\n`;
                });
                md += '\n';
            }
        });

        md += `## ${t('structure.deviation_risk')}\n\n`;
        md += `- **${t('table.project_std_dev')}** ${stdDev.toFixed(2)}\n`;
        md += `- **${t('table.project_variance')}** ${totalVariance.toFixed(2)}\n\n`;

        setMarkdownText(md);
        setEditorKey(prev => prev + 1);

    }, [project, modules, features, t]);

    const handleRefresh = () => {
        setEditorKey(prev => prev + 1);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(markdownText);
        setSnackbarOpen(true);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([markdownText], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${project?.title || 'Report'}_Report.md`;
        document.body.appendChild(element);
        element.click();
    };

    // Initialize Mermaid once outside the component
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Roboto',
    });

    // Mermaid Renderer Component
    const Mermaid = ({ code }: { code: string }) => {
        const [svg, setSvg] = useState('');
        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState(true);
        const id = useMemo(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`, []);

        useEffect(() => {
            let isMounted = true;
            setLoading(true);
            setError(null);

            mermaid.render(id, code.trim()).then(({ svg }) => {
                if (isMounted) {
                    setSvg(svg);
                    setLoading(false);
                }
            }).catch((err) => {
                if (isMounted) {
                    console.error('Mermaid render error:', err);
                    setError(err.message || 'Render Error');
                    setLoading(false);
                }
            });
            return () => { isMounted = false; };
        }, [code, id]);

        if (loading) return <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Rendering Diagram...</Box>;
        if (error) return (
            <Box sx={{ p: 2, border: '1px dashed red', borderRadius: 1, color: 'error.main', maxWidth: '100%', overflow: 'auto' }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Mermaid Error:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{error}</Typography>
                <Box component="pre" sx={{ fontSize: '0.7rem', backgroundColor: '#fff1f1', p: 1, borderRadius: 0.5 }}>
                    {code}
                </Box>
            </Box>
        );

        return <div dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', width: '100%', overflowX: 'auto' }} />;
    };

    const MermaidDescriptor: CodeBlockEditorDescriptor = {
        priority: 1,
        match: (language: string | null | undefined) => language === 'mermaid',
        Editor: ({ code }: { code: string }) => <Mermaid code={code} />
    };

    const mdxPlugins = useMemo(() => [
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        codeBlockPlugin({ codeBlockEditorDescriptors: [MermaidDescriptor] }),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
        toolbarPlugin({
            toolbarContents: () => (
                <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    <DiffSourceToggleWrapper>
                        {''}
                    </DiffSourceToggleWrapper>
                </div>
            )
        })
    ], []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={0}
                className="glass-paper"
                sx={{
                    mb: 4,
                    p: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary', mr: 2 }}>
                        {t('report.title')}
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title={t('report.print', 'Als PDF drucken')}>
                            <IconButton
                                onClick={handlePrint}
                                disabled={!project}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                                }}
                            >
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t('common.refresh', 'Aktualisieren')}>
                            <IconButton
                                onClick={handleRefresh}
                                disabled={!project}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopy}
                            disabled={!project}
                            sx={{ borderRadius: 2 }}
                        >
                            {t('report.copy')}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            disabled={!project}
                            sx={{ borderRadius: 2 }}
                        >
                            {t('report.download')}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 0, height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 3 }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        height: '100%',
                        overflowY: 'auto',
                        '& .mdxeditor': {
                            minHeight: '100%',
                            p: 2,
                            fontFamily: 'Roboto, sans-serif'
                        },
                        '& .mdxeditor-root': {
                            height: '100%'
                        }
                    }}
                >
                    <MDXEditor
                        key={editorKey}
                        markdown={markdownText}
                        readOnly={true}
                        plugins={mdxPlugins}
                        contentEditableClassName="prose max-w-none"
                    />
                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {t('report.copied_success')}
                </Alert>
            </Snackbar>
        </motion.div>
    );
}
