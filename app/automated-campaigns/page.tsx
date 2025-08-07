import AutomatedCampaigns from '../components/AutomatedCampaigns';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AutomatedCampaignsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <AutomatedCampaigns />
      </div>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: 'Campañas Automatizadas con IA | Red Creativa Pro',
  description: 'Crea campañas de email marketing automatizadas con IA. A/B testing, contenido inteligente y métricas en tiempo real.',
  keywords: 'email marketing, automatización, IA, ROI, campañas, A/B testing, analytics'
};