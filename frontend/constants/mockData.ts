import { Person, HeritageSite, HeritageSiteStory, Testimonial, HeritageSiteInsights } from '@/types/mock'

export type { Person, HeritageSite, HeritageSiteStory, Testimonial, HeritageSiteInsights }

// --- MOCK DATA STORE ---

import { SEED_PEOPLE } from './people'
import { SEED_HERITAGE_SITES } from './heritage-sites'

// ... existing interfaces ...

// --- MOCK DATA STORE ---

const USERS = [
  { id: 'u1', name: 'Investigador Principal' },
  { id: 'u2', name: 'Familiar de Romualdito' },
  { id: 'u3', name: 'Devoto Anónimo' }
];

export const MOCK_PEOPLE: Person[] = SEED_PEOPLE;

export const MOCK_HERITAGE_SITES: HeritageSite[] = SEED_HERITAGE_SITES;


export const MOCK_STORIES: HeritageSiteStory[] = [
  {
    id: 'st1',
    heritage_site_id: 's1',
    content: 'Romualdito es quizás la animita más famosa de Santiago. Se dice que fue un mecánico asesinado brutalmente en este lugar. Miles de placas de agradecimiento cubren el muro.',
    created_by: USERS[0],
    created_at: '2023-01-01T12:05:00Z',
    version: 1,
    approved: true
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    heritage_site_id: 's1',
    content: 'Gracias Romualdito por el favor concedido. Mi hijo pasó de curso.',
    created_by: {
      ...USERS[2],
      relation: 'devoto'
    },
    created_at: '2023-03-10T15:20:00Z',
    tags: ['agradecimiento', 'salud', 'estudios']
  }
];

export const MOCK_INSIGHTS: HeritageSiteInsights[] = [
  {
    heritage_site_id: 's1',
    memorial: {
      death_cause: 'violence',
      social_roles: ['Mecánico', 'Víctima'],
      narrator_relation: 'Investigador'
    },
    spiritual: {
      rituals_mentioned: ['Encender velas', 'Pegar placas'],
      offerings_mentioned: ['Flores', 'Placas'],
      digital_visit_count: 1250
    },
    patrimonial: {
      antiquity_year: 1933,
      size: 'Grande'
    },
    generated_at: '2023-12-01T10:00:00Z'
  }
];

// Helper para obtener datos completos de un sitio
export const getFullSiteData = (slug: string) => {
  const site = MOCK_HERITAGE_SITES.find(s => s.slug === slug);
  if (!site) return null;

  return {
    ...site,
    person: MOCK_PEOPLE.find(p => p.id === site.person_id),
    story: MOCK_STORIES.find(st => st.heritage_site_id === site.id && st.approved), // Última historia aprobada
    testimonials: MOCK_TESTIMONIALS.filter(t => t.heritage_site_id === site.id),
    insights: MOCK_INSIGHTS.find(i => i.heritage_site_id === site.id)
  };
};
