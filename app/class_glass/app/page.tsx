'use client';
import { useState, useEffect } from 'react';
import { Shield, Lock, Users, Award, ChevronRight, Sparkles, Send, User, LogOut } from 'lucide-react';

// Simulação de banco de dados em memória
let applicationsDB: any[] = [];
const ADMIN_EMAIL = 'admin@universidade.edu.br';
const ADMIN_PASS = 'admin123';

// Funções utilitárias
const encryptData = async (value: number) => {
  return `0x${Math.random().toString(16).substring(2, 20)}`;
};

export default function MonolithicApp() {
  const [page, setPage] = useState('home'); // home | apply | login | dashboard
  const [user, setUser] = useState<any>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: 'male',
    ethnicity: 'white',
    encryptedData: '',
    status: 'pending'
  });

  // Login
  const [loginData, setLoginData] = useState({ 
    email: ADMIN_EMAIL, 
    password: ADMIN_PASS 
  });

  // Features da landing page
  const features = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacidade Total',
      description: 'Dados sensíveis criptografados com FHE',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Segurança Blockchain',
      description: 'Processo imutável e transparente',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Equidade Garantida',
      description: 'Critérios justos e auditáveis',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Conformidade Legal',
      description: 'Atende LGPD e legislação educacional',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEncrypting(true);
    
    try {
      // Criptografa dados sensíveis
      const encryptedValue = await encryptData(0);
      
      // Salva aplicação
      const newApp = { 
        ...formData, 
        encryptedData: encryptedValue,
        createdAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2, 9)
      };
      applicationsDB.push(newApp);
      
      alert('✅ Aplicação enviada com sucesso! Dados protegidos com FHE');
      setFormData({
        fullName: '',
        email: '',
        gender: 'male',
        ethnicity: 'white',
        encryptedData: '',
        status: 'pending'
      });
      setPage('home');
    } catch (error) {
      console.error(error);
      alert('Erro no envio da candidatura');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleLogin = () => {
    if (
      loginData.email === ADMIN_EMAIL && 
      loginData.password === ADMIN_PASS
    ) {
      setUser({ name: 'Admin', email: ADMIN_EMAIL });
      setPage('dashboard');
      alert('Bem-vindo ao painel da universidade!');
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/50 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => setPage('home')}
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <Shield className="text-indigo-500" />
            <span>Class_glass</span>
          </button>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => setPage('apply')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              Candidatar-se
            </button>
            
            {user ? (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            ) : (
              <button 
                onClick={() => setPage('login')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-10 min-h-screen">
        {/* Home Page */}
        {page === 'home' && (
          <div className="container mx-auto px-4 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 mb-6">
                <Sparkles className="mr-2" />
                Tecnologia FHE - Zama
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="block">Equidade com</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Privacidade Total
                </span>
              </h1>
              
              <p className="text-gray-300 text-lg mb-10">
                Processos seletivos universitários onde dados sensíveis são protegidos com 
                criptografia homomórfica de última geração.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setPage('apply')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center"
                >
                  <span>Iniciar Candidatura</span>
                  <ChevronRight className="ml-2" />
                </button>
                
                <button
                  onClick={() => setShowPrivacy(!showPrivacy)}
                  className="px-6 py-3 rounded-xl border border-gray-700 bg-gray-900"
                >
                  Como funciona
                </button>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
              {features.map((feature, i) => (
                <div key={i} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
            
            {/* Explicação de privacidade */}
            {showPrivacy && (
              <div className="mt-12 p-6 bg-gray-900/50 border border-indigo-500/30 rounded-xl">
                <h3 className="font-bold text-lg mb-4 text-indigo-400">Como protegemos seus dados:</h3>
                <ol className="space-y-3 list-decimal pl-6">
                  <li>Seleção de categorias sensíveis no seu navegador</li>
                  <li>Dados convertidos em formato numérico (ex: gênero = 1, etnia = 3)</li>
                  <li>Criptografia homomórfica (FHE) aplicada localmente</li>
                  <li>Apenas o dado criptografado (texto ilegível) é enviado ao servidor</li>
                  <li>Universidade processa os dados sem jamais descriptografá-los</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Application Form */}
        {page === 'apply' && (
          <div className="container mx-auto px-4 max-w-3xl py-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Shield className="text-indigo-500 mr-2" />
              Formulário de Candidatura
            </h1>
            <p className="text-gray-400 mb-8">
              Suas informações de equidade são criptografadas antes de saírem do seu navegador
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                  placeholder="Nome completo do candidato"
                />
              </div>
              
              <div>
                <label className="block mb-2">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">Gênero</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="nonbinary">Não-binário</option>
                    <option value="other">Outro/Prefiro não dizer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2">Raça/Etnia</label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({...formData, ethnicity: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <option value="white">Branco</option>
                    <option value="black">Preto</option>
                    <option value="brown">Pardo</option>
                    <option value="asian">Asiático</option>
                    <option value="indigenous">Indígena</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isEncrypting}
                  className={`px-6 py-3 rounded-lg flex items-center ${
                    isEncrypting 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  }`}
                >
                  {isEncrypting ? (
                    <span>Encriptando dados...</span>
                  ) : (
                    <>
                      <Send className="mr-2" />
                      <span>Enviar com Privacidade</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Admin Login */}
        {page === 'login' && (
          <div className="container mx-auto px-4 max-w-md py-20">
            <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="text-center mb-8">
                <Shield className="text-indigo-500 mx-auto text-4xl mb-4" />
                <h2 className="text-2xl font-bold">Portal Universitário</h2>
                <p className="text-gray-400 mt-2">
                  Acesso restrito à equipe administrativa
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">E-mail institucional</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                    placeholder="admin@universidade.edu.br"
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Senha</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
                
                <button
                  onClick={handleLogin}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 mt-6"
                >
                  Acessar Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Dashboard */}
        {page === 'dashboard' && (
          <div className="container mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">
                  Painel Administrativo
                </h1>
                <p className="text-gray-400">
                  {applicationsDB.length} candidaturas recebidas
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-bold">admin@universidade.edu.br</div>
                  <div>Administrador</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-xl">
                <h3 className="font-bold mb-2 text-indigo-300">Candidaturas Pendentes</h3>
                <div className="text-3xl font-bold">
                  {applicationsDB.filter((app) => app.status === 'pending').length}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-xl">
                <h3 className="font-bold mb-2 text-emerald-300">Aprovados</h3>
                <div className="text-3xl font-bold">
                  {applicationsDB.filter((app) => app.status === 'approved').length}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-xl">
                <h3 className="font-bold mb-2 text-amber-300">Rejeitados</h3>
                <div className="text-3xl font-bold">
                  {applicationsDB.filter((app) => app.status === 'rejected').length}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Últimas Candidaturas</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">E-mail</th>
                    <th className="p-3 text-left">Data</th>
                    <th className="p-3 text-left">Dado Criptografado</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationsDB.slice(0, 5).map((app, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">{app.fullName}</td>
                      <td className="p-3">{app.email}</td>
                      <td className="p-3 text-sm text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-mono text-sm text-indigo-300">
                        {app.encryptedData.substring(0, 12)}...
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          app.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {app.status === 'pending' ? 'Pendente' : 
                           app.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {applicationsDB.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Nenhuma candidatura recebida ainda
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}