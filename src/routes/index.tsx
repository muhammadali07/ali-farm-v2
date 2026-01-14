import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react';
import { LandingPage } from '../components/LandingPage'
import { Language } from '../types';

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const navigate = useNavigate()
    const [lang, setLang] = useState<Language>(Language.EN);

    useEffect(() => {
        // IP-based Language Detection
        const detectLanguage = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code === 'ID') {
                    setLang(Language.ID);
                } else {
                    setLang(Language.EN);
                }
            } catch (error) {
                // Default EN
            }
        };
        detectLanguage();
    }, []);

    return <LandingPage onLogin={() => navigate({ to: '/login' })} lang={lang} />
}
