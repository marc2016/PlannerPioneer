import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Tasks() {
    const { t } = useTranslation();
    return (
        <Typography variant="h4">{t('tasks.page_title')}</Typography>
    );
}
