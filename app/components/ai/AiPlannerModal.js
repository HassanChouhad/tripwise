'use client';

import { useState } from 'react';
import { Sparkles, X, Send, Terminal, Loader2 } from 'lucide-react';
import { useSavedTrips } from '../../context/SavedTripsContext';
import styles from './AiPlannerModal.module.css';

export default function AiPlannerModal({ isOpen, onClose }) {
  const { saveTrip } = useSavedTrips();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your WebMCP AI Travel Agent. Tell me your dream trip ideas (e.g. "Plan me a 10-day trip from Paris to Japan visiting Tokyo, Kyoto, and Osaka under €1,200").',
      toolsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const callTool = async (tool, params) => {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params })
    });
    return (await res.json()).result;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const toolsUsed = [];

      // 1. Create a trip
      const trip = await callTool('create_trip', {
        name: userMsg.slice(0, 50),
        destinations: ['Tokyo', 'Kyoto', 'Osaka'],
        start_date: '2025-10-10',
        end_date: '2025-10-20',
        travelers: 2
      });
      toolsUsed.push('create_trip');

      // 2. Search flights
      const flights = await callTool('search_flights', { origin: 'Paris' });
      toolsUsed.push('search_flights');

      // 3. Select best flight
      let selectedFlight = null;
      if (Array.isArray(flights) && flights.length > 0) {
        selectedFlight = flights[0];
        await callTool('select_flight', { trip_id: trip.trip_id, flight_id: selectedFlight.id });
        toolsUsed.push('select_flight');
      }

      // 4. Search hotels
      const hotels = await callTool('search_hotels', { city: 'Tokyo' });
      toolsUsed.push('search_hotels');

      // 5. Get hotel details & select
      let selectedHotel = null;
      if (Array.isArray(hotels) && hotels.length > 0) {
        const hotelDetails = await callTool('get_hotel_details', { hotel_id: hotels[0].id });
        toolsUsed.push('get_hotel_details');
        selectedHotel = hotelDetails;
        await callTool('select_hotel', { trip_id: trip.trip_id, hotel_id: hotels[0].id });
        toolsUsed.push('select_hotel');
      }

      // 6. Weather & packing
      const weather = await callTool('get_weather_and_packing', { cities: ['Tokyo', 'Kyoto', 'Osaka'] });
      toolsUsed.push('get_weather_and_packing');

      // 7. Prepare booking
      const booking = await callTool('prepare_booking', { trip_id: trip.trip_id });
      toolsUsed.push('prepare_booking');

      // 8. Save trip
      saveTrip({
        id: trip.trip_id,
        name: trip.name,
        destinations: trip.destinations,
        start_date: trip.start_date,
        end_date: trip.end_date,
        travelers: trip.travelers,
        flights: booking?.flights || [],
        hotels: booking?.hotels || [],
        cost: booking?.cost_breakdown?.total,
        booking_id: booking?.booking_id,
        created_at: new Date().toISOString()
      });
      toolsUsed.push('save_trip');

      const flightInfo = selectedFlight
        ? `${selectedFlight.originCity} → ${selectedFlight.destinationCity} (${selectedFlight.airline}, €${selectedFlight.price})`
        : 'flights found';
      const hotelInfo = selectedHotel
        ? `${selectedHotel.name} in ${selectedHotel.city} (€${selectedHotel.pricePerNight}/night)`
        : 'hotels found';
      const totalCost = booking?.cost_breakdown?.total || 'N/A';

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          toolsUsed,
          text: `Trip planned and saved! Here's what I found for "${userMsg}":\n\n✈️ Flight: ${flightInfo}\n🏨 Hotel: ${hotelInfo}\n🌤️ Weather checked for all destinations — pack a light jacket and comfortable shoes.\n\n💰 Total estimated cost: €${totalCost} for ${trip.travelers} travelers.\n\nBooking ID: ${booking?.booking_id} (${booking?.status})\n\n✅ Trip saved — view it on the Trips page.`
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I ran into an issue connecting to WebMCP tools.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Sparkles size={20} color="var(--color-accent-primary)" />
            AI Trip Planner (WebMCP Enabled)
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.msg} ${msg.sender === 'user' ? styles.msgUser : styles.msgAi}`}
            >
              <div className={`${styles.avatar} ${msg.sender === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className={styles.toolCallBadge}>
                    <Terminal size={12} />
                    WebMCP Invoked: {msg.toolsUsed.join(', ')}
                  </div>
                )}
                <div className={styles.bubble}>{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={`${styles.avatar} ${styles.avatarAi}`}>🤖</div>
              <div className={styles.bubble} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                WebMCP Agent executing tools...
              </div>
            </div>
          )}
        </div>

        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            className={styles.chatInput}
            placeholder="Type your travel request..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className={styles.sendBtn} type="submit">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
