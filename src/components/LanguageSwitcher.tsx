import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (
        _event: React.MouseEvent<HTMLElement>,
        newLanguage: string,
    ) => {
        if (newLanguage) {
            i18n.changeLanguage(newLanguage);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">{t('common.language')}</Typography>
            <ToggleButtonGroup
                value={i18n.resolvedLanguage || i18n.language}
                exclusive
                onChange={handleLanguageChange}
                aria-label="language switcher"
                size="small"
            >
                <ToggleButton value="en">
                    English
                </ToggleButton>
                <ToggleButton value="de">
                    Deutsch
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
