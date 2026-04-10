import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Composant React pour la recherche vocale de trajets
 *
 * Utilisation:
 * <VoiceSearchTrips />
 */
export function VoiceSearchTrips() {
  const [voiceQuery, setVoiceQuery] = useState('');
  const [trips, setTrips] = useState([]);
  const [parsedQuery, setParsedQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedCities, setSupportedCities] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // Charger les villes supportées au montage
  useEffect(() => {
    fetchSupportedCities();
  }, []);

  // Initialiser Web Speech API pour la voix (optionnel)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported in this browser');
    }
  }, []);

  const fetchSupportedCities = async () => {
    try {
      const response = await axios.get('/api/voice-search/cities');
      setSupportedCities(response.data.cities || []);
    } catch (err) {
      console.error('Error fetching supported cities:', err);
    }
  };

  const handleVoiceSearch = async (e) => {
    e.preventDefault();

    if (!voiceQuery.trim()) {
      setError('Veuillez entrer une phrase de recherche');
      return;
    }

    setLoading(true);
    setError(null);
    setTrips([]);
    setParsedQuery(null);

    try {
      const response = await axios.post('/api/voice-search', {
        query: voiceQuery
      });

      if (response.data.success) {
        setTrips(response.data.trips || []);
        setParsedQuery(response.data.parsed_query);
      } else {
        setError(response.data.message || 'Erreur lors de la recherche');
        setParsedQuery(response.data.parsed_query);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  // Activer la reconnaissance vocale (optionnel)
  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;

    setIsListening(true);

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setVoiceQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setError(`Erreur audio: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voice-search-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🎙️ Recherche Vocale de Trajets</h1>

      {/* Formulaire de recherche */}
      <form onSubmit={handleVoiceSearch} className="search-form">
        <div className="input-group" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Ex: Je recherche un trajet douala yaounde demain a 16h j'ai 4000"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}
            disabled={isListening}
          />

          <button
            type="button"
            onClick={handleStartListening}
            disabled={isListening || loading}
            style={{
              padding: '12px 20px',
              backgroundColor: isListening ? '#ff6b6b' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isListening ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            title="Activer la reconnaissance vocale"
          >
            🎤 {isListening ? 'Écoute...' : 'Voix'}
          </button>

          <button
            type="submit"
            disabled={loading || isListening}
            style={{
              padding: '12px 30px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Recherche...' : '🔍 Chercher'}
          </button>
        </div>
      </form>

      {/* Afficher les erreurs */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ef5350'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Afficher la requête parsée */}
      {parsedQuery && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #2196F3'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>📋 Paramètres extraits:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <strong>Départ:</strong> {parsedQuery.departure || '❌ Non trouvé'}
            </div>
            <div>
              <strong>Destination:</strong> {parsedQuery.destination || '❌ Non trouvé'}
            </div>
            <div>
              <strong>Date:</strong> {parsedQuery.date}
            </div>
            <div>
              <strong>Heure:</strong> {parsedQuery.time || '(non spécifiée)'}
            </div>
            <div>
              <strong>Budget:</strong> {parsedQuery.budget ? `${parsedQuery.budget} FCFA` : '(non spécifié)'}
            </div>
          </div>
        </div>
      )}

      {/* Afficher les trajets trouvés */}
      {trips.length > 0 && (
        <div>
          <h2>✅ Trajets trouvés ({trips.length})</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {trips.map((trip) => (
              <div
                key={trip.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  hover: { backgroundColor: '#f0f0f0' }
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
                  {/* Infos du conducteur */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{trip.driver.name}</h4>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <div>⭐ Rating: {trip.driver.rating || 'N/A'}/5</div>
                      <div>🏆 Crédibilité: {trip.driver.credibility_points} pts</div>
                    </div>
                  </div>

                  {/* Infos du trajet */}
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {trip.departure_city} → {trip.arrival_city}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div>
                        🕐 <strong>{trip.departure_time}</strong>
                      </div>
                      <div>
                        💺 <strong>{trip.available_seats} place(s)</strong>
                      </div>
                      <div>
                        💰 <strong>{trip.price_per_seat} FCFA/place</strong>
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                      🚗 {trip.vehicle.brand} {trip.vehicle.model} - {trip.vehicle.color}
                    </div>
                  </div>
                </div>

                <button
                  style={{
                    marginTop: '12px',
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%',
                    fontWeight: 'bold'
                  }}
                >
                  Réserver ce trajet
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si pas de trajets trouvés mais requête valide */}
      {!loading && trips.length === 0 && parsedQuery && parsedQuery.departure && (
        <div style={{
          backgroundColor: '#fff3e0',
          color: '#e65100',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid #ffb74d',
          textAlign: 'center'
        }}>
          <p>😞 Aucun trajet ne correspond à votre recherche.</p>
          <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
            Essayez en modifiant vos critères (date, budget, villes)
          </p>
        </div>
      )}

      {/* Afficher les villes supportées */}
      <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>📍 Villes supportées ({supportedCities.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {supportedCities.map((city) => (
            <span
              key={city}
              style={{
                backgroundColor: '#e0e0e0',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px'
              }}
            >
              {city}
            </span>
          ))}
        </div>
      </div>

      {/* Exemples de phrases */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '4px' }}>
        <h3>💡 Exemples de phrases</h3>
        <ul style={{ fontSize: '14px', margin: '0', paddingLeft: '20px' }}>
          <li>Je recherche un trajet douala yaounde demain a 16h j'ai 4000</li>
          <li>Ydé douala demain 14h30 budget 3000</li>
          <li>Trajet yaounde bamenda apres demain 10h</li>
          <li>Kribi douala 20/04 18h prix 6000</li>
          <li>Douala yaounde aujourd'hui j'ai 2500</li>
        </ul>
      </div>
    </div>
  );
}

export default VoiceSearchTrips;
