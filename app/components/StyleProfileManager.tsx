'use client';

/**
 * Style Profile Manager Component
 * 
 * Manages writing samples and style profiles
 * Requirements: 4.1, 4.5, 14.1, 14.2, 14.3, 14.5
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    StyleLearningService,
    type WritingSample,
    type StyleProfile,
} from '@/app/lib/style-learning-service';

interface StyleProfileManagerProps {
    userId: string;
    onProfileUpdate?: (profile: StyleProfile) => void;
}

export function StyleProfileManager({ userId, onProfileUpdate }: StyleProfileManagerProps) {
    const [samples, setSamples] = useState<WritingSample[]>([]);
    const [newSampleText, setNewSampleText] = useState('');
    const [profile, setProfile] = useState<StyleProfile | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const service = new StyleLearningService();

    useEffect(() => {
        loadSamples();
    }, [userId]);

    const loadSamples = async () => {
        // In production, load from database
        // For now, load from localStorage
        const stored = localStorage.getItem(`style-samples-${userId}`);
        if (stored) {
            const loadedSamples = JSON.parse(stored);
            setSamples(loadedSamples);

            if (loadedSamples.length > 0) {
                updateProfile(loadedSamples);
            }
        }
    };

    const addSample = async () => {
        const text = newSampleText.trim();

        if (!text) return;

        const wordCount = text.split(/\s+/).length;

        if (wordCount < 100) {
            alert('La muestra debe tener al menos 100 palabras para un análisis preciso. Se recomienda 500+ palabras.');
            return;
        }

        const newSample: WritingSample = {
            id: `sample-${Date.now()}`,
            content: text,
            wordCount,
            addedAt: Date.now(),
        };

        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);
        setNewSampleText('');

        // Save to localStorage
        localStorage.setItem(`style-samples-${userId}`, JSON.stringify(updatedSamples));

        // Update profile
        await updateProfile(updatedSamples);
    };

    const removeSample = async (sampleId: string) => {
        const updatedSamples = samples.filter(s => s.id !== sampleId);
        setSamples(updatedSamples);

        // Save to localStorage
        localStorage.setItem(`style-samples-${userId}`, JSON.stringify(updatedSamples));

        // Update profile
        if (updatedSamples.length > 0) {
            await updateProfile(updatedSamples);
        } else {
            setProfile(null);
            onProfileUpdate?.(null as any);
        }
    };

    const updateProfile = async (samplesToAnalyze: WritingSample[]) => {
        setAnalyzing(true);

        try {
            const newProfile = await service.createProfile(samplesToAnalyze);
            setProfile(newProfile);

            // Save profile
            localStorage.setItem(`style-profile-${userId}`, JSON.stringify(newProfile));

            onProfileUpdate?.(newProfile);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);
    const confidencePercentage = profile ? Math.round(profile.confidence * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Profile Overview */}
            {profile && (
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Tu Perfil de Estilo
                                </CardTitle>
                                <CardDescription>
                                    Basado en {samples.length} muestra{samples.length !== 1 ? 's' : ''} ({totalWordCount.toLocaleString()} palabras)
                                </CardDescription>
                            </div>

                            <Badge variant={confidencePercentage >= 70 ? 'default' : 'secondary'}>
                                {confidencePercentage}% Confianza
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Tone Analysis */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Tono Dominante</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge>
                                    {profile.tone.primary.charAt(0).toUpperCase() + profile.tone.primary.slice(1)}
                                </Badge>
                                {profile.tone.secondary.map(tone => (
                                    <Badge key={tone} variant="outline">
                                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Structure */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-xs text-muted-foreground">Longitud de Oración</p>
                                <p className="text-lg font-bold">{profile.structure.avgSentenceLength} palabras</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Párrafo Promedio</p>
                                <p className="text-lg font-bold">{profile.structure.avgParagraphLength} oraciones</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Variedad</p>
                                <p className="text-lg font-bold">{profile.structure.sentenceLengthVariation}</p>
                            </div>
                        </div>

                        {/* Style Preview Button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {showPreview ? 'Ocultar' : 'Ver'} Cómo Afecta las Sugerencias
                        </Button>

                        {/* Style Preview */}
                        {showPreview && (
                            <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    Las sugerencias usarán este perfil:
                                </p>
                                <p className="text-sm font-mono">
                                    {/* Mock style application example */}
                                    "{profile.tone.primary === 'conversational'
                                        ? 'Voy a explicarte cómo funciona esto de forma sencilla...'
                                        : profile.tone.primary === 'formal'
                                            ? 'A continuación, se expondrá el funcionamiento del sistema...'
                                            : 'Este sistema funciona mediante un proceso específico...'}"
                                </p>
                                <p className="text-xs text-muted-foreground italic">
                                    ↑ Ejemplo de sugerencia adaptada a tu estilo {profile.tone.primary}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Guidance Alert */}
            {samples.length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Para que la IA aprenda tu estilo, agrega al menos una muestra de tu escritura (mínimo 100 palabras, recomendado 500+).
                        Cuanto más texto proporciones, más preciso será el análisis.
                    </AlertDescription>
                </Alert>
            )}

            {/* Add Sample */}
            <Card>
                <CardHeader>
                    <CardTitle>Agregar Muestra de Escritura</CardTitle>
                    <CardDescription>
                        Pega un ejemplo de tu mejor trabajo. Puede ser un artículo, blog post, o cualquier texto que represente tu voz.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Textarea
                        value={newSampleText}
                        onChange={(e) => setNewSampleText(e.target.value)}
                        placeholder="Pega aquí tu muestra de escritura..."
                        className="min-h-[200px] font-mono text-sm"
                    />

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {newSampleText.trim().split(/\s+/).filter(w => w).length} palabras
                            {newSampleText.trim().split(/\s+/).filter(w => w).length < 100 &&
                                newSampleText.trim().length > 0 &&
                                ' (mínimo 100)'
                            }
                        </span>

                        <Button
                            onClick={addSample}
                            disabled={analyzing || newSampleText.trim().length === 0}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Muestra
                        </Button>
                    </div>

                    {analyzing && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            Analizando tu estilo de escritura...
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Existing Samples */}
            {samples.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Muestras Guardadas ({samples.length})</CardTitle>
                        <CardDescription>
                            Total: {totalWordCount.toLocaleString()} palabras
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-3">
                            {samples.map((sample) => (
                                <div
                                    key={sample.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                {sample.wordCount} palabras
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(sample.addedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {sample.content.substring(0, 200)}...
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSample(sample.id)}
                                        className="shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {samples.length > 0 && totalWordCount < 500 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Tip:</strong> Para un análisis más preciso, intenta alcanzar al menos 500 palabras en total.
                        Actualmente tienes {totalWordCount} palabras.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
