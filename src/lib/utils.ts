import { User, Business, Activity, GameLevel, Badge } from './types';

// Utilitários para Local Storage
export const storage = {
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('communityUser');
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('communityUser', JSON.stringify(user));
  },

  getActivities: (): Activity[] => {
    if (typeof window === 'undefined') return [];
    const activities = localStorage.getItem('userActivities');
    return activities ? JSON.parse(activities) : [];
  },

  addActivity: (activity: Activity): void => {
    if (typeof window === 'undefined') return;
    const activities = storage.getActivities();
    activities.unshift(activity);
    localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 50))); // Manter apenas 50 atividades
  },

  clearData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('communityUser');
    localStorage.removeItem('userActivities');
  }
};

// Dados mock para demonstração
export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Café Central',
    category: 'Alimentação',
    description: 'Café artesanal e lanches saudáveis no coração da cidade',
    address: 'Rua das Flores, 123',
    location: { lat: -23.5505, lng: -46.6333 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    phone: '(11) 99999-1234',
    offers: [
      {
        id: '1',
        businessId: '1',
        title: '10% de desconto',
        description: 'Em qualquer bebida quente',
        discount: 10,
        pointsRequired: 50,
        validUntil: new Date('2024-12-31'),
        category: 'Desconto'
      }
    ],
    verified: true
  },
  {
    id: '2',
    name: 'Livraria Saber',
    category: 'Cultura',
    description: 'Livros novos e usados, espaço de leitura aconchegante',
    address: 'Av. Conhecimento, 456',
    location: { lat: -23.5515, lng: -46.6343 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    offers: [
      {
        id: '2',
        businessId: '2',
        title: 'Frete grátis',
        description: 'Em compras acima de R$ 50',
        discount: 0,
        pointsRequired: 100,
        validUntil: new Date('2024-12-31'),
        category: 'Benefício'
      }
    ],
    verified: true
  },
  {
    id: '3',
    name: 'Academia Vida Ativa',
    category: 'Saúde',
    description: 'Equipamentos modernos e aulas em grupo',
    address: 'Rua da Saúde, 789',
    location: { lat: -23.5525, lng: -46.6353 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    offers: [
      {
        id: '3',
        businessId: '3',
        title: 'Aula experimental grátis',
        description: 'Experimente qualquer modalidade',
        discount: 100,
        pointsRequired: 75,
        validUntil: new Date('2024-12-31'),
        category: 'Experiência'
      }
    ],
    verified: true
  }
];

// Sistema de níveis de gamificação
export const gameLevels: GameLevel[] = [
  {
    level: 1,
    name: 'Explorador',
    minPoints: 0,
    benefits: ['Acesso ao mapa de negócios'],
    color: 'from-gray-400 to-gray-600'
  },
  {
    level: 2,
    name: 'Descobridor',
    minPoints: 100,
    benefits: ['Ofertas exclusivas', 'Badge de Descobridor'],
    color: 'from-green-400 to-green-600'
  },
  {
    level: 3,
    name: 'Aventureiro',
    minPoints: 300,
    benefits: ['Descontos especiais', 'Prioridade em eventos'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    level: 4,
    name: 'Embaixador',
    minPoints: 600,
    benefits: ['Cashback em pontos', 'Acesso VIP'],
    color: 'from-purple-400 to-purple-600'
  },
  {
    level: 5,
    name: 'Lenda Local',
    minPoints: 1000,
    benefits: ['Benefícios premium', 'Influência na comunidade'],
    color: 'from-yellow-400 to-orange-600'
  }
];

// Utilitários de gamificação
export const gameUtils = {
  calculateLevel: (points: number): GameLevel => {
    return gameLevels.reduce((prev, current) => 
      points >= current.minPoints ? current : prev
    );
  },

  getPointsToNextLevel: (points: number): number => {
    const currentLevel = gameUtils.calculateLevel(points);
    const nextLevel = gameLevels.find(level => level.level > currentLevel.level);
    return nextLevel ? nextLevel.minPoints - points : 0;
  },

  awardPoints: (user: User, points: number, activity: Omit<Activity, 'id' | 'userId' | 'timestamp'>): User => {
    const newPoints = user.points + points;
    const newLevel = gameUtils.calculateLevel(newPoints);
    
    // Adicionar badge se subiu de nível
    const badges = [...user.badges];
    if (newLevel.level > user.level) {
      badges.push({
        id: `level-${newLevel.level}`,
        name: `Nível ${newLevel.name}`,
        description: `Alcançou o nível ${newLevel.name}`,
        icon: '🏆',
        earnedAt: new Date()
      });
    }

    const updatedUser = {
      ...user,
      points: newPoints,
      level: newLevel.level,
      badges
    };

    // Salvar atividade
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      userId: user.id,
      points,
      timestamp: new Date()
    };
    
    storage.addActivity(newActivity);
    storage.setUser(updatedUser);
    
    return updatedUser;
  }
};

// Utilitários de geolocalização
export const locationUtils = {
  getCurrentPosition: (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  },

  calculateDistance: (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};