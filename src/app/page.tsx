'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Trophy, Gift, User, Home, Search, Award, Plus, Heart, Share2, ShoppingBag } from 'lucide-react';
import { User as UserType, Business, Activity } from '@/lib/types';
import { storage, mockBusinesses, gameUtils, locationUtils } from '@/lib/utils';

export default function ComunidadeLocalAtiva() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'profile' | 'auth'>('auth');
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Estados do formulário de registro
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const user = storage.getUser();
    if (user) {
      setCurrentUser(user);
      setCurrentView('home');
      setActivities(storage.getActivities());
    }

    // Tentar obter localização do usuário
    locationUtils.getCurrentPosition()
      .then(setUserLocation)
      .catch(() => {
        // Usar localização padrão (São Paulo) se não conseguir obter
        setUserLocation({ lat: -23.5505, lng: -46.6333 });
      });
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'register') {
      const newUser: UserType = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        points: 0,
        level: 1,
        badges: [],
        joinedAt: new Date(),
        location: userLocation || undefined
      };
      
      storage.setUser(newUser);
      setCurrentUser(newUser);
      setCurrentView('home');
      
      // Dar pontos de boas-vindas
      const welcomeUser = gameUtils.awardPoints(newUser, 50, {
        type: 'referral',
        description: 'Boas-vindas à Comunidade Local Ativa!',
        points: 50
      });
      setCurrentUser(welcomeUser);
    } else {
      // Simulação de login - em produção seria validação real
      const user = storage.getUser();
      if (user && user.email === formData.email) {
        setCurrentUser(user);
        setCurrentView('home');
      }
    }
  };

  const handleBusinessInteraction = (business: Business, type: 'visit' | 'like' | 'share') => {
    if (!currentUser) return;

    let points = 0;
    let description = '';

    switch (type) {
      case 'visit':
        points = 20;
        description = `Visitou ${business.name}`;
        break;
      case 'like':
        points = 5;
        description = `Curtiu ${business.name}`;
        break;
      case 'share':
        points = 10;
        description = `Compartilhou ${business.name}`;
        break;
    }

    const updatedUser = gameUtils.awardPoints(currentUser, points, {
      type,
      businessId: business.id,
      description,
      points
    });

    setCurrentUser(updatedUser);
    setActivities(storage.getActivities());
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    const distance = userLocation 
      ? locationUtils.calculateDistance(userLocation, business.location)
      : null;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
        <div className="relative">
          <img 
            src={business.image} 
            alt={business.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{business.rating}</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{business.name}</h3>
              <p className="text-sm text-gray-600">{business.category}</p>
            </div>
            {business.verified && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Verificado
              </div>
            )}
          </div>
          
          <p className="text-gray-700 text-sm mb-3">{business.description}</p>
          
          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{business.address}</span>
            {distance && (
              <span className="text-xs text-gray-500 ml-2">
                • {distance.toFixed(1)}km
              </span>
            )}
          </div>

          {business.offers.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Oferta Especial</span>
              </div>
              <p className="text-sm text-purple-700">{business.offers[0].title}</p>
              <p className="text-xs text-purple-600">{business.offers[0].pointsRequired} pontos</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleBusinessInteraction(business, 'visit')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
            >
              Visitar (+20 pts)
            </button>
            <button
              onClick={() => handleBusinessInteraction(business, 'like')}
              className="bg-gray-100 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
            <button
              onClick={() => handleBusinessInteraction(business, 'share')}
              className="bg-gray-100 hover:bg-blue-50 p-2 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600 hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AuthView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comunidade Local Ativa</h1>
          <p className="text-gray-600">Descubra, interaja e ganhe pontos com negócios locais</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              authMode === 'register' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Registrar
          </button>
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              authMode === 'login' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Entrar
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            {authMode === 'register' ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );

  const HomeView = () => {
    const currentLevel = gameUtils.calculateLevel(currentUser!.points);
    const pointsToNext = gameUtils.getPointsToNextLevel(currentUser!.points);

    return (
      <div className="pb-20">
        {/* Header com informações do usuário */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Olá, {currentUser!.name}!</h2>
              <p className="text-purple-100">Nível {currentLevel.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentUser!.points}</div>
              <div className="text-sm text-purple-100">pontos</div>
            </div>
          </div>

          {/* Barra de progresso */}
          {pointsToNext > 0 && (
            <div className="bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${((currentUser!.points - (currentLevel.minPoints || 0)) / (pointsToNext + (currentUser!.points - (currentLevel.minPoints || 0)))) * 100}%` 
                }}
              />
            </div>
          )}
          
          {pointsToNext > 0 && (
            <p className="text-sm text-purple-100">
              {pointsToNext} pontos para o próximo nível
            </p>
          )}
        </div>

        {/* Badges recentes */}
        {currentUser!.badges.length > 0 && (
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Conquistas Recentes
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentUser!.badges.slice(0, 5).map((badge) => (
                <div key={badge.id} className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 min-w-[120px] text-center">
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negócios em destaque */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Negócios em Destaque
            </h3>
            <button 
              onClick={() => setCurrentView('map')}
              className="text-purple-600 text-sm font-medium"
            >
              Ver todos
            </button>
          </div>
          
          {businesses.slice(0, 3).map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {/* Atividades recentes */}
        {activities.length > 0 && (
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              Atividades Recentes
            </h3>
            <div className="space-y-2">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-green-600 font-bold text-sm">
                    +{activity.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const MapView = () => (
    <div className="pb-20">
      <div className="bg-white p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar negócios locais..."
            className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Todos', 'Alimentação', 'Cultura', 'Saúde', 'Serviços'].map((category) => (
            <button
              key={category}
              className="bg-gray-100 hover:bg-purple-100 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Simulação de mapa */}
      <div className="bg-gradient-to-br from-green-100 to-blue-100 h-64 flex items-center justify-center m-4 rounded-2xl">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">Mapa Interativo</p>
          <p className="text-sm text-gray-600">Negócios próximos a você</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-4">Negócios Próximos</h3>
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );

  const ProfileView = () => {
    const currentLevel = gameUtils.calculateLevel(currentUser!.points);
    
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold">{currentUser!.name}</h2>
            <p className="text-purple-100">{currentUser!.email}</p>
            <div className="mt-4 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser!.points}</div>
                <div className="text-sm text-purple-100">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser!.level}</div>
                <div className="text-sm text-purple-100">Nível</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser!.badges.length}</div>
                <div className="text-sm text-purple-100">Badges</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Nível atual */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Nível Atual</h3>
            <div className={`bg-gradient-to-r ${currentLevel.color} rounded-lg p-4 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{currentLevel.name}</span>
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <p key={index} className="text-sm opacity-90">• {benefit}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Todas as badges */}
          {currentUser!.badges.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Todas as Conquistas</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentUser!.badges.map((badge) => (
                  <div key={badge.id} className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{badge.name}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico completo */}
          {activities.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Histórico de Atividades</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-green-600 font-bold text-sm">
                      +{activity.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de logout */}
          <button
            onClick={() => {
              storage.clearData();
              setCurrentUser(null);
              setCurrentView('auth');
            }}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  };

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {[
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'map', icon: MapPin, label: 'Mapa' },
          { id: 'profile', icon: User, label: 'Perfil' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id as any)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              currentView === id 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'home' && <HomeView />}
      {currentView === 'map' && <MapView />}
      {currentView === 'profile' && <ProfileView />}
      <BottomNavigation />
    </div>
  );
}